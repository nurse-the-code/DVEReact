import { DVEN } from "divine-voxel-engine/Nexus";

import { INIT_NEXUS_PLAYER } from "dve-plugins-player/Nexus/";
(async () => {
  await DVEN.$INIT();
  const player = await INIT_NEXUS_PLAYER(DVEN);
  player.setPosition(0, 120, 0);

  setInterval(() => {
    player.update();
  }, 17);
})();
