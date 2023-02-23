import { DVEC } from "divine-voxel-engine/Constructor/";

(async () => {
  DVEC.voxelManager.registerVoxel(
    DVEC.voxelManager.defaults.box.simple("dve_debug", [
      "#dve_solid",
      "dve_debug",
    ])
  );
  await DVEC.$INIT();
})();
