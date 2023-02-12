import { DVEW } from "divine-voxel-engine/dist/World/DivineVoxelEngineWorld.js";
import { $INITWorldPlayer } from "./Player/WorldPlayer";
import { WorldGen } from "./WorldGen";

(async () => {
  DVEW.voxelManager.registerVoxelData([
    {
      id: "dve_debug",
      tags: [
        ["#dve_substance", "#dve_solid"],
        ["#dve_shape_id", "#dve_box"],
        ["#dve_check_collisions", true],
        ["#dve_collider_id", "#dve_box"],
        ["#dve_hardness", 100_0000],
        ["#dve_material", "stone"],
      ],
    },
  ]);

  await DVEW.$INIT();

  const numChunks = 2;
  let startX = -16 * numChunks;
  let startZ = -16 * numChunks;
  let endX = 16 * numChunks;
  let endZ = 16 * numChunks;

  const builder = DVEW.getBuilder();

  const tasks = DVEW.getTasksTool();
  for (let x = startX; x < endX; x += 16) {
    for (let z = startZ; z < endZ; z += 16) {
      WorldGen.generateWorldColumn(x, z);
      tasks.light.worldSun.add(x, z);
    }
  }
  await tasks.light.worldSun.runAndAwait();
  for (let x = startX; x < endX; x += 16) {
    for (let z = startZ; z < endZ; z += 16) {
      builder.setXZ(x, z).buildColumn();
    }
  }

  const worldPlayer = await $INITWorldPlayer(DVEW);
  setInterval(() => {
    worldPlayer.update();
  }, 20);
})();
