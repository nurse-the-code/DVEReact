import { PlayerPhysicsData } from "../../../Data/Player/PlayerPhysicsData";
import { PlayerStatsData } from "../../../Data/Player/PlayerStatsData";

export const PlayerManager = {
  currentDimension: "main",
  currentSpell: "#ecd_place_crystalbox",
  physics: <PlayerPhysicsData>{},
  stats: <PlayerStatsData>{},

  $INIt(data: any[]) {},
};
