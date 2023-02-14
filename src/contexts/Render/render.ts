import { DVER } from "divine-voxel-engine/dist/Render/DivineVoxelEngineRender";
import { BabylonSystem } from "../../Babylon/EngineSystem";
import {
  BoundingBox,
  BoundingInfo,
  Color3,
  Effect,
  Engine,
  Mesh,
  RawTexture2DArray,
  Scene,
  ShaderMaterial,
  Texture,
  TransformNode,
  UniversalCamera,
  Vector3,
  Vector4,
  VertexData,
  ArcRotateCamera,
  HemisphericLight,
  MeshBuilder,
  Color4,
} from "babylonjs";
import { $INITPlayer } from "./Player/InitPlayer";
(window as any).BABYLON = BABYLON;
export async function $INIT_DVER() {
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
      Scene: Scene,
      Engine: Engine,
      RawTexture2DArray: RawTexture2DArray,
      Texture: Texture,
      Vector3: Vector3,
      Vector4: Vector4,
      UniversalCamera: UniversalCamera,
      TransformNode: TransformNode,
      ShaderMaterial: ShaderMaterial,
      Mesh: Mesh,
      BoundingBox: BoundingBox,
      BoundingInfo: BoundingInfo,
      VertexData: VertexData,
      Effect: Effect,
      Color3: Color3,
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
  engine.runRenderLoop(() => {
    scene.render();
  });

  await $INITPlayer();
}
