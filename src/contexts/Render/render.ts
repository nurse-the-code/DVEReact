import { DVER } from "divine-voxel-engine/Render/";
import { BabylonSystem } from "../../Babylon/EngineSystem";

//BABYLON
//FOR DVER
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { RawTexture2DArray } from "@babylonjs/core/Materials/Textures/rawTexture2DArray.js";
import { Texture } from "@babylonjs/core/Materials/Textures/texture.js";
import { Scene } from "@babylonjs/core/scene.js";
import { Engine } from "@babylonjs/core/Engines/engine.js";
import { Vector3, Vector4 } from "@babylonjs/core/Maths/math.vector.js";
import { Color3 } from "@babylonjs/core/Maths/math.color.js";
import { Effect } from "@babylonjs/core/Materials/effect.js";
import { Mesh } from "@babylonjs/core/Meshes/mesh.js";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera.js";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode.js";
import { ShaderMaterial } from "@babylonjs/core/Materials/shaderMaterial.js";
import { BoundingBox } from "@babylonjs/core/Culling/boundingBox.js";
import { BoundingInfo } from "@babylonjs/core/Culling/boundingInfo.js";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData.js";
//FOR DVE PLAYER
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder.js";
import { EdgesRenderer } from "@babylonjs/core/Rendering/edgesRenderer.js";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial.js";

import { INIT_RENDER_PLAYER } from "dve-plugins-player/Render/";
let init = false;
export async function $INIT_DVER() {
  if(init) return;
  init = true;
  console.log("INIT DVER")
  DVER.textures.defineDefaultTexturePath("assets/textures");
  DVER.textures.registerTexture([
    {
      type: "#dve_solid",
      id: "dve_debug",
      frames: 0,
      variations: {
        top: { frames: 0 },
        bottom: { frames: 0 },
        north: { frames: 0 },
        south: { frames: 0 },
        east: { frames: 0 },
        west: { frames: 0 },
      },
    },
  ]);


  const workers = SetUpWorkers();
  await DVER.$INIT({
    worldWorker: workers.worldWorker,
    constructorWorker: workers.constructorWorkers,
    nexusWorker: workers.nexusWorker,
    nexus: {
      enabled: true,
      autoSyncVoxelPalette: true,
      autoSyncChunks: true,
    },
    meshes: {
      clearChachedGeometry: true,
    },
  });
(window as any).DVER = DVER;
  await $INIT_RENDER();
}



function SetUpWorkers() {
  const worldWorker = new Worker(new URL("../World/world.ts", import.meta.url));

  const constructorWorkers: Worker[] = [];
  const totalWorkers = navigator.hardwareConcurrency - 2;
  let i = totalWorkers;
  while (i--) {
    constructorWorkers.push(
      new Worker(new URL("../Constructor/constructor.ts", import.meta.url))
    );
  }
  const nexusWorker = new Worker(new URL("../Nexus/nexus.ts", import.meta.url));

  return {
    worldWorker,
    constructorWorkers,
    nexusWorker,
  };
}

let ran = false;
export async function $INIT_RENDER() {
  if (ran) return;
  ran = true;

  const { canvas, engine, scene } = BabylonSystem;

  window.addEventListener("click", function () {
    canvas.requestPointerLock();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key == "Escape") {
      document.exitPointerLock();
    }
  });

  let antialias = false;

  engine.doNotHandleContextLost = true;
  engine.enableOfflineSupport = false;
  engine.setSize(1920, 1080);

  // scene.fogEnabled = true;
  scene.autoClear = false;
  scene.autoClearDepthAndStencil = false;
  scene.skipPointerMovePicking = true;
  scene.constantlyUpdateMeshUnderPointer = false;

  const hemLight = new HemisphericLight("", new Vector3(0, 1, 0), scene);

  const skybox = MeshBuilder.CreateBox("skyBox", { size: 800.0 }, scene);
  skybox.infiniteDistance = true;

  await DVER.$SCENEINIT({
    scene: scene,
    system: {
      Scene,
      Engine,
      RawTexture2DArray,
      Texture,
      Vector3,
      Vector4,
      UniversalCamera,
      TransformNode,
      ShaderMaterial,
      Mesh,
      BoundingBox,
      BoundingInfo,
      VertexData,
      Effect,
      Color3,
    },
  });

  const camera = DVER.render.getDefaultCamera(scene);
  camera.position.y = 70;
  camera.setTarget(Vector3.Zero());
  camera.inertia = 0.2;
  BabylonSystem.camera = camera;
  // camera.maxZ = 1000;

  const bmat = DVER.render.skyBoxMaterial.createMaterial(scene);
  if (bmat) {
    skybox.material = bmat;
  }
  DVER.render.setBaseLevel(0.05);
  DVER.render.setSunLevel(0.5);
  DVER.render.updateFogOptions({
    color: new Color3(0, 0.4, 0.5),
  });
  DVER.render.updateFogOptions({
    mode: "volumetric",
    density: 0.0005,
  });

  DVER.render.updateShaderEffectOptions({
    floraEffects: true,
    liquidEffects: true,
  });

  scene.clearColor.r = 1;

  console.log("here");
  const player = await INIT_RENDER_PLAYER(
    scene,
    camera,
    DVER,
    {
      CreateBox,
      EdgesRenderer,
      StandardMaterial,
    },
    MeshBuilder.CreateBox("", { width: 1, height: 1, depth: 1 })
  );

  player.controls.mouse.right.down.add(() => {
    DVER.worldComm.runTasks("break", []);
  });
  player.controls.mouse.left.down.add(() => {
    DVER.worldComm.runTasks("place", []);
  });

  engine.runRenderLoop(() => {
    scene.render();
  });
console.log("done")
}
