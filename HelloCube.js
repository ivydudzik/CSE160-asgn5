import * as THREE from 'three';

// CANVAS & RENDERER
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

// CAMERA DATA
const fov = 75;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 5;

// CREATE CAMERA
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2;

// SCENE
const scene = new THREE.Scene();

// CUBE DATA
const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

// LIGHT DATA
const color = 0xFFFFFF;
const intensity = 3;

// CREATE LIGHT
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 4);
scene.add(light);

// CREATE LIGHT
const light2 = new THREE.DirectionalLight(color, intensity);
light2.position.set(4, -5, -8);
scene.add(light2);

// CREATE MULTIPLE CUBES
const cubes = [
    makeInstance(geometry, 0x44aa88, 0),
    makeInstance(geometry, 0x8844aa, -2),
    makeInstance(geometry, 0xaa8844, 2),
];

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