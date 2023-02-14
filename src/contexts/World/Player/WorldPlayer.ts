import { VisitAll } from "divine-voxel-engine/dist/Math/Functions/VisitAll";
import { DivineVoxelEngineWorld } from "divine-voxel-engine/dist/World/DivineVoxelEngineWorld";
import { PlayerPhysicsData } from "../../../Data/Player/PlayerPhysicsData";
import { PlayerManager } from "../../Shared/Player/PlayerManager";

export const WorldPlayer = {
  manager: PlayerManager,
  playerDataBuffer: new SharedArrayBuffer(1),
  data: new DataView(new ArrayBuffer(1)),
  position: new Float32Array(),
  onAdd: <((raw: number[], x: number, y: number, z: number) => void)[]>[],
  onRemove: <((x: number, y: number, z: number) => void)[]>[],
  onExplode: <((x: number, y: number, z: number, radius: number) => void)[]>[],
  onUpdate: <(() => void)[]>[],
  dimension: "main",
  getDimension() {
    return this.dimension;
  },
  update() {},
};

async function SetUpPlayerData(DVEW: DivineVoxelEngineWorld) {
  let playerDataReady = false;
  DVEW.nexusComm.listenForMessage("connect-player-tags", (data) => {
    PlayerManager.physics = new PlayerPhysicsData(data[1], data[2]);
    playerDataReady = true;
  });
  DVEW.nexusComm.sendMessage("request-player-tags", []);

  await DVEW.UTIL.createPromiseCheck({
    check: () => {
      if (!playerDataReady) {
        DVEW.nexusComm.sendMessage("request-player-tags", []);
      }
      return playerDataReady;
    },
    checkInterval: 1,
  });
}

export const $INITWorldPlayer = async (DVEW: DivineVoxelEngineWorld) => {
  await SetUpPlayerData(DVEW);
  const dataTool = DVEW.getDataTool();

  const start = {
    x: 0,
    y: 0,
    z: 0,
  };
  const end = {
    x: 0,
    y: 0,
    z: 0,
  };

  const reachDistance = 5;

  const brush = DVEW.getBrush();

  DVEW.parentComm.listenForMessage("add", async () => {
    let x =
      PlayerManager.physics.pick.position.x +
      PlayerManager.physics.pick.normal.x;
    let y =
      PlayerManager.physics.pick.position.y +
      PlayerManager.physics.pick.normal.y;
    let z =
      PlayerManager.physics.pick.position.z +
      PlayerManager.physics.pick.normal.z;
    if (!dataTool.loadInAt(x, y, z)) return;
    if (dataTool.isRenderable()) return;
    await brush.setId("dve_debug").setXYZ(x, y, z).paintAndAwaitUpdate();
  });

  DVEW.parentComm.listenForMessage("remove", async () => {
    let x = PlayerManager.physics.pick.position.x;
    let y = PlayerManager.physics.pick.position.y;
    let z = PlayerManager.physics.pick.position.z;
    if (!dataTool.loadInAt(x, y, z)) return;
    if (dataTool.isRenderable()) {
      await brush.setXYZ(x, y, z).eraseAndAwaitUpdate();
    }
  });

  WorldPlayer.update = () => {
    WorldPlayer.onUpdate.forEach((_) => _());
    start.x = PlayerManager.physics.position.x;
    start.y = PlayerManager.physics.position.y + PlayerManager.physics.eyeLevel;
    start.z = PlayerManager.physics.position.z;
    end.x = PlayerManager.physics.direction.x * reachDistance + start.x;
    end.y = PlayerManager.physics.direction.y * reachDistance + start.y;
    end.z = PlayerManager.physics.direction.z * reachDistance + start.z;
    const voxels = VisitAll(start, end);
    let foundVoxel = false;
    for (let i = 0; i < voxels.length; i += 3) {
      const x = voxels[i];
      const y = voxels[i + 1];
      const z = voxels[i + 2];

      if (!dataTool.loadInAt(x, y, z)) continue;
      const substance = dataTool.getSubstance();
      if (substance == "liquid" || substance == "magma") continue;
      if (dataTool.isRenderable()) {
        PlayerManager.physics.pick.position.x = x;
        PlayerManager.physics.pick.position.y = y;
        PlayerManager.physics.pick.position.z = z;
        foundVoxel = true;
        break;
      }
    }
    if (!foundVoxel) PlayerManager.physics.pick.position.set(-Infinity, 0, 0);
  };
  return WorldPlayer;
};
