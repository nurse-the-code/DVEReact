import { DVEN } from "divine-voxel-engine/dist/Nexus/DivineVoxelEngineNexus";
import { DVP } from "divine-voxel-engine/dist/Plugins/Physics/Nexus/DivineVoxelPhysics";
import { GetNexusPlayer } from "./Player/NexusPlayer";

(async () => {
  await DVEN.$INIT();
  const player = await GetNexusPlayer(DVEN, DVP);
})();
