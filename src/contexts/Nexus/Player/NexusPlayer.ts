import { DivineVoxelEngineNexus } from "divine-voxel-engine/dist/Nexus/DivineVoxelEngineNexus";
import { DivineVoxelEnginePhysics } from "divine-voxel-engine/dist/Plugins/Physics/Nexus/DivineVoxelPhysics";
import {
  PlayerPhysicsData,
  PlayerPhysicsStatesValues,
} from "../../../Data/Player/PlayerPhysicsData";

import { $RegisterPlayerData } from "../../Shared/Player/RegisterPlayerData";
import { PlayerStatsData } from "../../../Data/Player/PlayerStatsData";

import { PlayerManager } from "../../Shared/Player/PlayerManager";

async function SetUpPlayerData(DVEN: DivineVoxelEngineNexus) {
  const { playerPhysicsTagManager, playerStatesTagManger } =
    $RegisterPlayerData();
  const physicsRemoteData = playerPhysicsTagManager.initData;
  const playePhysicsrDataSAB = new SharedArrayBuffer(
    physicsRemoteData.bufferSize
  );
  playerPhysicsTagManager.setBuffer(playePhysicsrDataSAB);
  PlayerManager.physics = new PlayerPhysicsData(
    playePhysicsrDataSAB,
    physicsRemoteData
  );

  const statsRemoteData = playerStatesTagManger.initData;
  const playeStatsDataSAB = new SharedArrayBuffer(physicsRemoteData.bufferSize);
  playerPhysicsTagManager.setBuffer(playePhysicsrDataSAB);
  const PlayerStats = new PlayerStatsData(playeStatsDataSAB, statsRemoteData);
  let renderReady = false;
  let worldReady = false;

  DVEN.parentComm.listenForMessage("request-player-tags", (data: any) => {
    DVEN.parentComm.sendMessage("connect-player-tags", [
      playePhysicsrDataSAB,
      physicsRemoteData,
      playeStatsDataSAB,
      statsRemoteData,
    ]);
    renderReady = true;
  });
  DVEN.worldComm.listenForMessage("request-player-tags", (data: any) => {
    DVEN.worldComm.sendMessage("connect-player-tags", [
      playePhysicsrDataSAB,
      physicsRemoteData,
      playeStatsDataSAB,
      statsRemoteData,
    ]);
    worldReady = true;
  });

  await DVEN.UTIL.createPromiseCheck({
    checkInterval: 1,
    check: () => {
      return renderReady && worldReady;
    },
  });

  return { PlayerStats };
}

export const GetNexusPlayer = async (
  DVEN: DivineVoxelEngineNexus,
  DVP: DivineVoxelEnginePhysics,
  waitForMessageFromWorld = false
) => {
  const { PlayerStats } = await SetUpPlayerData(DVEN);
  const gravity = -0.1;

  const PlayerPhysicsData = PlayerManager.physics;
  const jumpMaxDefault = 10;
  const player = DVEN.UTIL.merge(DVP.createEntityObject(), {
    states: {
      cilmbingStair: false,
      inWater: false,
      onLadder: false,
    },
    msterialStandingOn: "none",
    finalDirection: DVP.math.getVector3(0, 0, 0),
    sideDirection: DVP.math.getVector3(0, 0, 0),
    speed: 0.04,
    runSpeed: 0.03,
    hitBox: { w: 0.8, h: 1.8, d: 0.8 },
    jumpStates: {
      count: 0,
      max: 10,
      jumping: false,
      canJump: true,
    },
    movementFunctions: <Record<number, Function>>{},
    gravityAcceleration: 0,

    $INIT() {
      player.setPosition(10, 80, 7);
      player.cachePosition();
      player.velocity.y = gravity;
      player.syncPosition(PlayerManager.physics.position);
    },
    controlsUpdate() {
      //reset direction
      player.finalDirection.scaleXYZ(0);
      //get forward direction from where the player is looking
      player.direction.updateVector(
        PlayerPhysicsData.direction.x,
        0,
        PlayerPhysicsData.direction.z
      );
      player.direction.normalize();
      //get side direction from where the player is looking
      player.sideDirection.updateVector(
        PlayerPhysicsData.sideDirection.x,
        0,
        PlayerPhysicsData.sideDirection.z
      );
      player.sideDirection.normalize();
      //apply any changes on the direction vector based on player's state
      player.movementFunctions[PlayerPhysicsData.states.movement]();
      player.movementFunctions[PlayerPhysicsData.states.secondaryMovement]();

      //finally add, nomalize, then scale
      player.finalDirection.addFromVec3(player.direction);
      player.finalDirection.addFromVec3(player.sideDirection);
      if (!player.finalDirection.isZero()) {
        player.finalDirection.normalize();
      }
      player.finalDirection.scaleXYZ(player.getSpeed());

      //set the player's velcoity based on their state
      if (
        PlayerPhysicsData.states.movement ||
        PlayerPhysicsData.states.secondaryMovement
      ) {
        player.velocity.x = player.finalDirection.x;
        player.velocity.z = player.finalDirection.z;
      }

      if (player.onGround || player.states.inWater) {
        player.gravityAcceleration = 0;
      }
      if (player.onGround) {
        player.velocity.y = gravity;
      }

      //player jump
      if (
        PlayerPhysicsData.states.jumping &&
        !player.jumpStates.jumping &&
        (player.onGround || player.states.inWater)
      ) {
        player.jumpStates.jumping = true;
        player.jumpStates.max = jumpMaxDefault;
        player.velocity.y = 0.1 + PlayerStats.jumpPower / 1000;
        PlayerPhysicsData.states.jumping = 0;
      }

      if (player.jumpStates.jumping) {
        if (player.jumpStates.count >= player.jumpStates.max) {
          player.jumpStates.count = 0;
          player.jumpStates.jumping = false;
        } else {
          player.jumpStates.count++;
        }
      }

      //player in air or water
      if (!player.onGround && !player.jumpStates.jumping) {
        player.gravityAcceleration += 0.0025;
        if (player.states.inWater) {
          player.velocity.y -= 0.0025;
          if (player.velocity.y < -0.01) {
            player.velocity.y = -0.01;
          }
        } else {
          if (player.velocity.y <= gravity) {
            player.velocity.y = gravity;
          }
          player.velocity.y -= player.gravityAcceleration;
        }
      }
    },
    getSpeed() {
      return (
        PlayerPhysicsData.states.running * player.runSpeed +
        //for every level of speed add a tenth of the player's base speed
        (player.speed + PlayerStats.speed * player.speed * 0.1)
      );
    },
    beforeUpdate() {
      player.states.inWater = false;
      for (let y = player.position.y; y <= player.position.y + 1; y++) {
        for (let x = player.position.x - 1; x <= player.position.x + 1; x++) {
          for (let z = player.position.z - 1; z <= player.position.z + 1; z++) {
            if (player.dataTool.loadInAt(x >> 0, y >> 0, z >> 0)) {
              if (player.dataTool.getSubstance() == "#dve_liquid") {
                player.states.inWater = true;
                break;
              }
            }
          }
        }
      }
      player.controlsUpdate();
      if (player.onGround) {
        if (
          player.dataTool.loadInAt(
            player.position.x >> 0,
            (player.position.y - 1) >> 0,
            player.position.z >> 0
          )
        ) {
          let material = player.dataTool.getMaterial();

          if (material != this.msterialStandingOn) {
            this.msterialStandingOn = material;
            DVEN.parentComm.sendMessage("set-material", [material]);
          }
        }
      }
      PlayerPhysicsData.states.onGround = player.onGround;
      PlayerPhysicsData.states.inWater = player.states.inWater;
      if (player.states.cilmbingStair) {
        player.setVelocity(0, 1, -1.5);
        player.velocity.scaleXYZ(player.getSpeed());
      }
      player.states.cilmbingStair = false;
    },
    afterUpdate() {
      player.syncPosition(PlayerPhysicsData.position);
    },
  });

  player.movementFunctions[PlayerPhysicsStatesValues.still] = () => {
    player.direction.scaleXYZ(0);
  };
  player.movementFunctions[PlayerPhysicsStatesValues.secondaryStill] = () => {
    player.sideDirection.scaleXYZ(0);
  };
  player.movementFunctions[PlayerPhysicsStatesValues.walkingForward] = () => {};
  player.movementFunctions[PlayerPhysicsStatesValues.walkingBackward] = () => {
    player.direction.scaleXYZ(-1);
  };
  player.movementFunctions[PlayerPhysicsStatesValues.walkingLeft] = () => {};
  player.movementFunctions[PlayerPhysicsStatesValues.walkingRight] = () => {
    player.sideDirection.scaleXYZ(-1);
  };

  player.doCollision = (colliderName, colliderData) => {
    if (
      (colliderName == "stair-bottom" || colliderName == "stair-top") &&
      colliderData.h < 0.3
    ) {
      if (colliderData.nz == 1) {
        player.states.cilmbingStair = true;
        return;
      }
      if (colliderData.ny == 1) {
        player.states.cilmbingStair = false;
        return;
      }
    }

    player.states.cilmbingStair = false;
  };

  player.$INIT();

  DVEN.parentComm.listenForMessage("set-player-position", (data) => {
    const [m, x, y, z] = data;
    player.setPosition(x, y, z);
  });

  setTimeout(() => {
    setInterval(() => {
      player.update();
    }, 17);
  }, 2000);

  return player;
};
