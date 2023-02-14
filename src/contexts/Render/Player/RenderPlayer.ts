import { PlayerPhysicsStatesValues } from "../../../Data/Player/PlayerPhysicsData";
import { DVER } from "divine-voxel-engine/dist/Render/DivineVoxelEngineRender.js";
import { Mesh, TransformNode, UniversalCamera, Vector3 } from "babylonjs";

import { PlayerManager } from "../../Shared/Player/PlayerManager";

/*
PLAYER 
*/

type PlayerRenderNodes = {
  model: Mesh;
  camera: UniversalCamera;
  camNode: TransformNode;
};
export const RenderPlayer = {
  settings: {
    doWalkEffect: false,
  },
  maanger: PlayerManager,
  nodes: <PlayerRenderNodes>{},
  direction: new Vector3(0, 0, 0),
  sideDirection: new Vector3(0, 0, 0),
  xzd: new Vector3(0, 0, 0),
  cameraRotation: new Vector3(0, 0, 0),

  $INIT(nodes: PlayerRenderNodes) {
    this.nodes = nodes;
  },

  render() {
    //update physics data
    const camera = this.nodes.camera;
    camera.getDirectionToRef(Vector3.Forward(), this.direction);
    camera.getDirectionToRef(Vector3.Left(), this.sideDirection);
    PlayerManager.physics.direction.set(
      this.direction.x,
      this.direction.y,
      this.direction.z
    );
    PlayerManager.physics.sideDirection.set(
      this.sideDirection.x,
      this.sideDirection.y,
      this.sideDirection.z
    );
    const rotation = camera.rotation;
    PlayerManager.physics.rotation.set(rotation.x, rotation.y, rotation.z);
    /* 
      DAE.space.setListenerPosition(position.x, position.y, position.z);
      DAE.space.setListenerDirection(
        direction.x * -1,
        direction.y,
        direction.z * -1
      ); */

    //walk effect
    if (this.settings.doWalkEffect) {
      let et = performance.now();
      this.xzd.x = this.direction.x;
      this.xzd.z = this.direction.z;
      this.xzd.normalize();
      if (
        PlayerManager.physics.states.movement ==
        PlayerPhysicsStatesValues.walkingForward
      ) {
        let runFactor = 0.02 * PlayerManager.physics.states.running;
        let factor = 0.008 + runFactor;
        let yd = Math.abs(this.direction.y) > 0.5 ? 0 : 1;
        this.cameraRotation.x =
          Math.cos(et / 100) * factor * Number(this.xzd.x.toFixed(1)) * yd;
        this.cameraRotation.z =
          Math.cos(et / 100) * factor * Number(this.xzd.z.toFixed(1)) * yd;
        this.cameraRotation.y = Math.abs(Math.sin(et / 100)) * factor;
      } else {
        this.cameraRotation.scaleInPlace(0.5);
      }
      this.nodes.camNode.rotation = Vector3.Lerp(
        this.cameraRotation,
        this.nodes.camNode.rotation,
        0.25
      );
    }
  },

  interact() {
    /*     DVER.worldComm.runPromiseTasks<CastSpellTask>(
      "interact",
      crypto.randomUUID(),
      (data : any) => {},
      ["#ecd_place_crystalbox", []]
    ); */
  },
};
