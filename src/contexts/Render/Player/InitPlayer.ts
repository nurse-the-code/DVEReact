import { DVER } from "divine-voxel-engine/dist/Render/DivineVoxelEngineRender";
import { PlayerStatsData } from "../../../Data/Player/PlayerStatsData";
import { PlayerPhysicsData } from "../../../Data/Player/PlayerPhysicsData";

import { PlayerManager } from "../../Shared/Player/PlayerManager";
import { SetUpControls } from "./SetUpControls";
import { RenderPlayer } from "./RenderPlayer";
import { BabylonSystem } from "../../../Babylon/EngineSystem";
import { Mesh, MeshBuilder, Scene, TransformNode, Vector3 } from "babylonjs";

async function SetUpPlayerData() {
  let playerDataReady = false;
  let playerStats: PlayerStatsData;
  DVER.nexusComm.listenForMessage("connect-player-tags", (data: any[]) => {
    playerStats = new PlayerStatsData(data[3], data[4]);
    PlayerManager.stats = playerStats;
    PlayerManager.physics = new PlayerPhysicsData(data[1], data[2]);
    playerDataReady = true;
  });

  (window as any).data = PlayerPhysicsData;
  await DVER.UTIL.createPromiseCheck({
    check: () => {
      if (!playerDataReady) {
        DVER.nexusComm.sendMessage("request-player-tags", []);
      }
      return playerDataReady;
    },
    checkInterval: 1,
  });

  //@ts-ignore
  return { playerStats };
}

const GetPlayerModel = (scene: Scene): Promise<Mesh> => {
  return new Promise((resolve, reject) => {
    resolve(MeshBuilder.CreateBox("player", { width: 1, height: 2 }, scene));
  });
};

export async function $INITPlayer() {
  const { camera, scene } = BabylonSystem;

  await SetUpPlayerData();

  PlayerManager.physics.eyeLevel = 0.7;

  //move camera to player's eye level
  camera.position.y = PlayerManager.physics.eyeLevel;
  camera.inputs.removeByType("FreeCameraKeyboardMoveInput");

  //set up model
  const playerModel = await GetPlayerModel(scene);
  playerModel.isVisible = false;

  //set up camera
  const camNode = new TransformNode("camnode", scene);
  camera.parent = camNode;
  camNode.parent = playerModel;

  //set up floating origin
  const oriign = new Vector3();
  scene.onBeforeActiveMeshesEvaluationObservable.add(() => {
    oriign.x = PlayerManager.physics.position.x;
    oriign.y = PlayerManager.physics.position.y;
    oriign.z = PlayerManager.physics.position.z;
  });
  DVER.render.fo.setOriginCenter(scene, { position: oriign });

  (window as any).PlayerManager = PlayerManager;

  PlayerManager.physics.position.y = 100;

  RenderPlayer.$INIT({
    model: playerModel,
    camNode: camNode,
    camera: camera,
  });

  SetUpControls();

  scene.registerBeforeRender(() => {
    RenderPlayer.render();
  });
}
