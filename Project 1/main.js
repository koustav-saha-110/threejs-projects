/**
 * Import Statements
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as CANNON from 'cannon';
import * as dat from 'lil-gui';

/**
 * Initializing TextureLoader
 */
const textureLoader = new THREE.TextureLoader();
const s_0 = textureLoader.load('./textures/sphere.jpg');
s_0.wrapS = THREE.RepeatWrapping;
s_0.wrapT = THREE.RepeatWrapping;

const s_1 = textureLoader.load('./textures/sphere1.jpg');
const b_0 = textureLoader.load('./textures/box.jpg');
b_0.wrapS = THREE.RepeatWrapping;
b_0.wrapT = THREE.RepeatWrapping;

const b_1 = textureLoader.load('./textures/box1.jpg');

/**
 * Array to Store the Meshes
 */
let arrayOfMeshes = [];

/**
 * lil-gui Initialization
 */
const gui = new dat.GUI();
const debugObjects = {};

/**
 * Canvas
 */
const canvas = document.querySelector('#canvas');

/**
 * Scene
 */
const scene = new THREE.Scene();

// cannonjs Initialization
const world = new CANNON.World();
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;
world.gravity.set(0, - 9.82, 0);

/**
 * Contact Material of World
 */
const contactMaterial = new CANNON.ContactMaterial(
  new CANNON.Material('default'),
  new CANNON.Material('default'),
  {
    friction: 0.1,
    restitution: 0.7,
  }
);
world.defaultContactMaterial = contactMaterial;

/**
 * Directional Light
 */
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.60);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.radius = 5;
directionalLight.position.set(1, 1, -1);
scene.add(directionalLight);

/**
 * Ambient Light
 */
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

/**
 * THREEJS Plane
 */
const Tplane = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({
    color: "#777777",
    metalness: 0.3,
    roughness: 0.4
  })
);
Tplane.receiveShadow = true;
Tplane.position.set(0, - 0.7, 0);
Tplane.rotation.set(- (Math.PI * 0.5), 0, 0);
scene.add(Tplane);

/**
 * CANNON Plane
 */
const Splane = new CANNON.Body({
  mass: 0,
  shape: new CANNON.Plane(),
  position: new CANNON.Vec3(0, - 0.7, 0),
});
Splane.quaternion.setFromAxisAngle(
  new CANNON.Vec3(1, 0, 0),
  - (Math.PI * 0.5)
);
world.addBody(Splane);

/**
 * Sizes
 */
const sizes = {};
sizes.width = window.innerWidth;
sizes.height = window.innerHeight;

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(- 3, 2, 8);
camera.castShadow = true;
scene.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.render(scene, camera);

/**
 * Resize Function
 */
window.addEventListener('resize', () => {
  sizes.width = innerWidth;
  sizes.height = innerHeight;

  /**
   * Updating Camera
   */
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  /**
   * Updating Renderer
   */
  renderer.setSize(sizes.width, sizes.height);
  renderer.render(scene, camera);
});

/**
 * OrbitControls
 */
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Hit Audio Initialization
 */
const hitAudio = new Audio('./assets/hit.mp3');
function sound(e) {
  let impact = e.contact.getImpactVelocityAlongNormal();
  
  if (impact > 1) {
    hitAudio.volume = Math.random();
    hitAudio.play();
  };
};

/**
 * Function of createSpheres
 */
const createSpheres = (radius, positions) => {
  /**
   * THREEJS Sphere
   */
  const Tsphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 32, 32),
    new THREE.MeshStandardMaterial({
      color: "white",
      metalness: 0.3,
      roughness: 0.4,
      map: s_0,
      aoMap: s_0,
    })
  );
  Tsphere.castShadow = true;
  scene.add(Tsphere);

  /**
   * CANNON Sphere
   */
  const Ssphere = new CANNON.Body({
    mass: 1,
    shape: new CANNON.Sphere(radius),
    position: new CANNON.Vec3(
      positions.x,
      positions.y,
      positions.z
    )
  });
  world.addBody(Ssphere);

  /**
   * Adding EventListener
   */
  Ssphere.addEventListener('collide', sound);

  /**
   * Pushing into the array
   */
  arrayOfMeshes.push({
    mesh: Tsphere,
    body: Ssphere
  });
};

debugObjects.createSpheres = () => {
  createSpheres(
    (Math.random() * 0.5) + 0.2,
    {
      x: (Math.random() * 0.5) * 4,
      y: (Math.random() * 0.5) * 4,
      z: (Math.random() * 0.5) * 4
    }
  );
};

gui.add(
  debugObjects,
  'createSpheres'
).name('Create Sphere');

/**
 * Function of createBoxes
 */
const createBoxes = (box, positions) => {
  /**
   * THREEJS Box
   */
  let map = `b_${Math.round(Math.random() * (1 - 0) + 0)}`;
  const Tbox = new THREE.Mesh(
    new THREE.BoxGeometry(box.width, box.height, box.depth, 10, 10, 10),
    new THREE.MeshStandardMaterial({
      color: "white",
      metalness: 0.3,
      roughness: 0.4,
      map: b_0,
      aoMap: b_0
    })
  );
  Tbox.castShadow = true;
  scene.add(Tbox);

  /**
   * CANNON Box
   */
  const Sbox = new CANNON.Body({
    shape: new CANNON.Box(
      new CANNON.Vec3(
        box.width * 0.5,
        box.height * 0.5,
        box.depth * 0.5,
      )
    ),
    mass: 1,
    position: new CANNON.Vec3(
      positions.x,
      positions.y,
      positions.z,
    )
  });
  world.addBody(Sbox);

  /**
   * Adding EventListener
   */
  Sbox.addEventListener('collide', sound);

  /**
   * Pushing into the array
   */
  arrayOfMeshes.push({
    mesh: Tbox,
    body: Sbox
  });
};

debugObjects.createBoxes = () => {
  createBoxes(
    {
      width: (Math.random() * 0.5) * 2,
      height: (Math.random() * 0.5) * 2,
      depth: (Math.random() * 0.5) * 2,
    },
    {
      x: (Math.random() * 0.5) * 4,
      y: (Math.random() * 0.5) * 4,
      z: (Math.random() * 0.5) * 4
    }
  );
};

gui.add(
  debugObjects,
  'createBoxes'
).name('Create Box');

debugObjects.createSpheresAndBoxes = () => {
  createSpheres(
    (Math.random() * 0.5) + 0.2,
    {
      x: (Math.random() * 0.5) * 4,
      y: (Math.random() * 0.5) * 4,
      z: (Math.random() * 0.5) * 4
    }
  );
  createBoxes(
    {
      width: (Math.random() * 0.5) * 2,
      height: (Math.random() * 0.5) * 2,
      depth: (Math.random() * 0.5) * 2,
    },
    {
      x: (Math.random() * 0.5) * 4,
      y: (Math.random() * 0.5) * 4,
      z: (Math.random() * 0.5) * 4
    }
  );
};

gui.add(
  debugObjects,
  'createSpheresAndBoxes'
).name('Create Both');

debugObjects.resetObjects = () => {
  for (const objects of arrayOfMeshes) {
    objects.body.removeEventListener('collide');
    scene.remove(objects.mesh);
    world.remove(objects.body);
  };
};

gui.add(
  debugObjects,
  'resetObjects'
).name('Reset All');

/**
 * Tick Function
 */
const clock = new THREE.Clock();
let oldElapsedTime = 0;

function tick() {
  window.requestAnimationFrame(tick);
  controls.update();

  /**
   * Updating the CANNON World
   */
  let elapsedTime = clock.getElapsedTime();
  let deltaTime = elapsedTime - oldElapsedTime;
  oldElapsedTime = elapsedTime;

  for (const objects of arrayOfMeshes) {
    objects.mesh.position.copy(objects.body.position);
    objects.mesh.quaternion.copy(objects.body.quaternion);
  };

  world.step(1 / 60, deltaTime, 3);

  renderer.render(scene, camera);
}
tick();