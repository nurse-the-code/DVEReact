import { DVEC } from "divine-voxel-engine/dist/Constructor/DivineVoxelEngineConstructor";

(async () => {
  DVEC.voxelManager.registerVoxel(
    DVEC.voxelManager.defaults.box.simple("dve_debug", [
      "#dve_solid",
      "dve_debug",
    ])
  );
  await DVEC.$INIT();
})();
