import { DVEW } from "divine-voxel-engine/World/";
import { INIT_WORLD_PLAYER } from "dve-plugins-player/World/";
import { WorldGen } from "./WorldGen";

import { PlayerManager } from "dve-plugins-player";
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
  console.log("sup");

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
  console.log("sup 22");
  await tasks.light.worldSun.runAndAwait();
  for (let x = startX; x < endX; x += 16) {
    for (let z = startZ; z < endZ; z += 16) {
      builder.setXZ(x, z).buildColumn();
    }
  }
  console.log("sup 2");
  const worldPlayer = await INIT_WORLD_PLAYER(DVEW);
  setInterval(() => {
    worldPlayer.update();
  }, 20);

  const brush = DVEW.getBrush();
  DVEW.TC.registerTasks("break", async () => {
    const { x, y, z } = PlayerManager.physics.pick.position;
    await brush.setXYZ(x, y, z).eraseAndAwaitUpdate();
  });
  DVEW.TC.registerTasks("place", async () => {
    const [x, y, z] = PlayerManager.physics.pick.getPlacePosition();
    await brush.setId("dve_debug").setXYZ(x, y, z).paintAndAwaitUpdate();
  });
})();
