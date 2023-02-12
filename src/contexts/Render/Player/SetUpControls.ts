import { DVER } from "divine-voxel-engine/dist/Render/DivineVoxelEngineRender";
import { BabylonSystem } from "../../../Babylon/EngineSystem";
import { GetPlayerPickCube } from "./PlayerPickCube";
import { RenderPlayer } from "./RenderPlayer";

export function SetUpControls() {
  const { camera, scene } = BabylonSystem;
  const { cube, setPickNormals } = GetPlayerPickCube();
  RenderPlayer.maanger.physics.nowIs.still();

  window.addEventListener("keydown", (event) => {
    if (event.key == "Home") {
      DVER.render.setSunLevel(0.8);
      DVER.render.updateFogOptions({
        color: new BABYLON.Color3(0, 0.6, 0.8),
      });
    }
    if (event.key == "PageUp") {
      DVER.render.setSunLevel(0.5);
      DVER.render.updateFogOptions({
        color: new BABYLON.Color3(0, 0.4, 0.5),
      });
    }
    if (event.key == "PageDown") {
      DVER.render.setSunLevel(0.2);
      DVER.render.updateFogOptions({
        color: new BABYLON.Color3(0, 0.15, 0.2),
      });
    }
    if (event.key == "End") {
      DVER.render.setSunLevel(0);
      DVER.render.updateFogOptions({
        color: new BABYLON.Color3(0, 0.0, 0.0),
      });
    }

    if (event.key == "w" || event.key == "W") {
      RenderPlayer.maanger.physics.nowIs.walkingForward();
    }

    if (event.key == "s" || event.key == "S") {
      RenderPlayer.maanger.physics.nowIs.walkingBackward();
    }

    if (event.key == "a" || event.key == "A") {
      RenderPlayer.maanger.physics.nowIs.walkingLeft();
    }
    if (event.key == "d" || event.key == "D") {
      RenderPlayer.maanger.physics.nowIs.walkingRight();
    }

    if (event.key == " ") {
      RenderPlayer.maanger.physics.nowIs.jumping();
    }
    if (event.key == "Control") {
      RenderPlayer.maanger.physics.nowIs.running();
    }
  });
  window.addEventListener("keyup", (event) => {
    if (event.key == "w" || event.key == "W") {
      return RenderPlayer.maanger.physics.nowIs.walkingForward(false);
    }
    if (event.key == "s" || event.key == "S") {
      return RenderPlayer.maanger.physics.nowIs.walkingBackward(false);
    }
    if (event.key == "a" || event.key == "A") {
      return RenderPlayer.maanger.physics.nowIs.walkingLeft(false);
    }
    if (event.key == "d" || event.key == "D") {
      return RenderPlayer.maanger.physics.nowIs.walkingRight(false);
    }
    if (event.key == " ") {
      RenderPlayer.maanger.physics.nowIs.jumping(false);
    }
    if (event.key == "Control") {
      RenderPlayer.maanger.physics.nowIs.running(false);
    }
  });

  window.addEventListener("click", (event) => {
    if (event.button == 2) {
      setPickNormals();
      DVER.worldComm.sendMessage("add", []);
    }
    if (event.button == 0) {
      DVER.worldComm.sendMessage("remove", []);
    }
  });
}
