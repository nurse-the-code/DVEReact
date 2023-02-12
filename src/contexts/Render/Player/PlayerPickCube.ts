import {
  Color3,
  Color4,
  MeshBuilder,
  StandardMaterial,
  Vector3,
} from "babylonjs";
import { DVER } from "divine-voxel-engine/dist/Render/DivineVoxelEngineRender";
import { BabylonSystem } from "../../../Babylon/EngineSystem";
import { PlayerManager } from "../../Shared/Player/PlayerManager";
/*
PICK CUBE  
*/
export const GetPlayerPickCube = () => {
  const { camera, scene } = BabylonSystem;
  const cubeMaterial = new StandardMaterial("block");
  cubeMaterial.diffuseColor = new Color3(0.2, 0.2, 0.2);
  cubeMaterial.alpha = 0.3;
  const cube = MeshBuilder.CreateBox("playerblockdisplay", {
    size: 1.1,
  });
  cube.isPickable = true;
  cube.material = cubeMaterial;

  cube.parent = DVER.render.fo.activeNode;
  cube.enableEdgesRendering();
  cube.edgesWidth = 0.3;
  cube.edgesColor = new Color4(0, 0, 0, 0.8);

  cube.convertToFlatShadedMesh();

  const cameraPickPostion = new Vector3();
  cameraPickPostion.y = PlayerManager.physics.eyeLevel;
  const setPickNormals = () => {
    const camPick = scene.pickWithRay(
      camera.getForwardRay(10, undefined, cameraPickPostion)
    );
    if (
      !camPick ||
      !camPick.hit ||
      !camPick.pickedMesh ||
      camPick.faceId === undefined
    )
      return;
    let normal = camPick.pickedMesh.getFacetNormal(camPick.faceId);
    PlayerManager.physics.pick.normal.x = normal.x;
    PlayerManager.physics.pick.normal.y = normal.y;
    PlayerManager.physics.pick.normal.z = normal.z;
  };

  scene.registerBeforeRender(() => {
    cube.position.x = PlayerManager.physics.pick.position.x + 0.5;
    cube.position.y = PlayerManager.physics.pick.position.y + 0.5;
    cube.position.z = PlayerManager.physics.pick.position.z + 0.5;
  });

  return { cube, setPickNormals };
};
