import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';


// CANVAS & RENDERER
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

// CAMERA DATA
const fov = 75;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 100;

// CREATE CAMERA
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 10, 20);

// CREATE CONTROLS
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 5, 0);
controls.update();

// SCENE
const scene = new THREE.Scene();

// SKYBOX
{

    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
        'Assets/Skybox/posx.jpg',
        'Assets/Skybox/negx.jpg',
        'Assets/Skybox/posy.jpg',
        'Assets/Skybox/negy.jpg',
        'Assets/Skybox/posz.jpg',
        'Assets/Skybox/negz.jpg',
    ]);
    scene.background = texture;


}

/// LIGHTS ///

// POINT LIGHT
{
    // Light Data
    const color = 0xFFF11F;
    const intensity = 100;
    const distance = 10;

    // Create Light
    const light = new THREE.PointLight(color, intensity, distance);
    light.position.set(-1, 4, 4);
    scene.add(light);
}


// SKYLIGHT
{

    const skyColor = 0xB1E1FF; // light blue
    const groundColor = 0xB97A20; // brownish orange
    const intensity = 0.5;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);

}

// SUNLIGHT
{

    const color = 0xFFFFFF;
    const intensity = 0.5;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(5, 10, 2);
    scene.add(light);
    scene.add(light.target);

}

/// PRIMITIVES ///

// CUBE 

// Cube Data
const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

// Create Multiple Cubes
const cubes = [
    makeInstance(geometry, 0x44aa88, 0),
    makeInstance(geometry, 0x8844aa, -2),
    makeInstance(geometry, 0xaa8844, 2),
];


// PLANE
{

    const planeSize = 40;

    const loader = new THREE.TextureLoader();
    const texture = loader.load('https://threejs.org/manual/examples/resources/images/checker.png');
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * - .5;
    scene.add(mesh);

}

/// OBJECTS ///

// HEART MESH
{
    const mtlLoader = new MTLLoader();
    mtlLoader.load('Assets/Heart/1410 Heart.mtl', (mtl) => {

        mtl.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(mtl);
        objLoader.load('Assets/Heart/1410 Heart.obj', (heart) => {

            heart.scale.set(0.05, 0.05, 0.05)
            heart.position.set(0, -1, 0)
            cubes[0].add(heart);

        });

    });
}


// Set Window Size & Aspect
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();

renderer.setSize(window.innerWidth, window.innerHeight);

// Listen for Window Resize
window.addEventListener('resize', onWindowResize);

// Render
requestAnimationFrame(render);



function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function makeInstance(geometry, color, x) {
    const material = new THREE.MeshPhongMaterial({ color });

    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    cube.position.x = x;
    cube.position.y = 1;

    return cube;
}

function render(time) {
    time *= 0.001;  // convert time to seconds

    cubes.forEach((cube, ndx) => {
        const speed = 1 + ndx * .1;
        const rot = time * speed;
        cube.rotation.x = rot;
        cube.rotation.y = rot;
    });

    renderer.render(scene, camera);

    requestAnimationFrame(render);
}