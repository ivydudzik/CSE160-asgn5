import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js';
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
import { AfterimagePass } from 'three/addons/postprocessing/AfterimagePass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';



let canvas;
let renderer;

let composer;
let pixelPass;
let filmPass;
let afterimagePass;
let outputPass;

let camera;
let scene;

// DYNAMIC OBJECTS
let shapes = [];
let heart;
let defaultHeartScale = 0.05;

function main() {
    // CANVAS & RENDERER
    canvas = document.querySelector('#c');
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.shadowMap.enabled = true;

    // CAMERA DATA
    const fov = 75;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 1000;

    // CREATE CAMERA
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 10, 20);

    // CREATE CONTROLS
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();

    // SCENE
    scene = new THREE.Scene();

    /// POSTPROCESSING ///

    // COMPOSER
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    // PIXELATE
    pixelPass = new RenderPixelatedPass(
        3,     // pixel size
        scene,
        camera
    );
    composer.addPass(pixelPass);

    // FILMIC
    filmPass = new FilmPass(
        1,   // intensity
        false,  // grayscale
    );
    composer.addPass(filmPass);

    // AFTERIMAGE
    afterimagePass = new AfterimagePass(0.75
    );
    composer.addPass(afterimagePass);

    // OUTPUT
    outputPass = new OutputPass();
    composer.addPass(outputPass);

    // FOG
    {
        const near = 25;
        const far = 150;
        const color = 'black';
        scene.fog = new THREE.Fog(color, near, far);
        scene.background = new THREE.Color(color);
    }

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

    // YELLOW POINT LIGHT
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

    // HEART POINT LIGHT
    {
        // Light Data
        const color = 0xFF1111;
        const intensity = 1000;
        const distance = 100;

        // Create Light
        const light = new THREE.PointLight(color, intensity, distance);
        light.castShadow = true;
        light.near = 0.1;
        light.far = 1000;
        light.position.set(0, 6, 0);
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

    // SHAPE ARRAY 

    // Cube 
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    // Sphere 
    const sphereDiameter = 0.70;
    const sphereGeometry = new THREE.SphereGeometry(sphereDiameter);

    // Cone
    const coneGeometry = new THREE.ConeGeometry(sphereDiameter, boxHeight);

    // Create Multiple Shapes
    shapes = [
        makeInstance(geometry, 0x44aa88, 0),
        makeInstance(sphereGeometry, 0x8844aa, -2),
        makeInstance(coneGeometry, 0xaa8844, 2),
    ];




    // // PLANE
    // {

    //     const planeSize = 40;

    //     const loader = new THREE.TextureLoader();
    //     const texture = loader.load('https://threejs.org/manual/examples/resources/images/checker.png');
    //     texture.colorSpace = THREE.SRGBColorSpace;
    //     texture.wrapS = THREE.RepeatWrapping;
    //     texture.wrapT = THREE.RepeatWrapping;
    //     texture.magFilter = THREE.NearestFilter;
    //     const repeats = planeSize / 2;
    //     texture.repeat.set(repeats, repeats);

    //     const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    //     const planeMat = new THREE.MeshPhongMaterial({
    //         map: texture,
    //         side: THREE.DoubleSide,
    //     });
    //     const mesh = new THREE.Mesh(planeGeo, planeMat);
    //     mesh.receiveShadow = true;

    //     mesh.rotation.x = Math.PI * - .5;
    //     mesh.position.set(0, -5, 0);
    //     scene.add(mesh);

    // }

    /// OBJECTS ///

    // CAVE MESH
    // Cave (Part 1 of 3) by Danni Bittman [CC-BY] (https://creativecommons.org/licenses/by/3.0/) via Poly Pizza (https://poly.pizza/m/5RlkbcRZiP1)
    {
        const mtlLoader = new MTLLoader();
        mtlLoader.load('Assets/Cave/materials.mtl', (mtl) => {

            mtl.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials(mtl);
            objLoader.load('Assets/Cave/model.obj', (cave_obj) => {
                cave_obj.scale.set(45, 45, 45);
                cave_obj.position.set(0, 5.5, 0);
                cave_obj.traverse(function (child) { child.receiveShadow = true; });
                scene.add(cave_obj);
            });

        });
    }


    // CAGE MESH
    // Cage Medieval by hat_my_guy (https://poly.pizza/m/mybhRIyuL9)
    {
        const mtlLoader = new MTLLoader();
        mtlLoader.load('Assets/Cage/Cage.mtl', (mtl) => {

            mtl.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials(mtl);
            objLoader.load('Assets/Cage/Cage.obj', (cage_obj) => {
                cage_obj.scale.set(2, 2, 2);
                cage_obj.position.set(0, 5.5, 0);
                cage_obj.traverse(function (child) { child.castShadow = true; });
                scene.add(cage_obj);
            });

        });
    }

    // HEART MESH (From Google Poly)
    {
        const mtlLoader = new MTLLoader();
        mtlLoader.load('Assets/Heart/1410 Heart.mtl', (mtl) => {

            mtl.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials(mtl);
            objLoader.load('Assets/Heart/1410 Heart.obj', (heart_obj) => {
                heart = heart_obj;
                heart.scale.set(0.05, 0.05, 0.05);
                heart.position.set(0, 4, 0);
                scene.add(heart);
            });

        });
    }

    // Set Window Size & Aspect
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    composer.setSize(window.innerWidth, window.innerHeight);

    renderer.setSize(window.innerWidth, window.innerHeight);

    // Listen for Window Resize
    window.addEventListener('resize', onWindowResize);

    // Render
    requestAnimationFrame(render);
}


function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    composer.setSize(window.innerWidth, window.innerHeight);

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function makeInstance(geometry, color, x) {
    const material = new THREE.MeshPhongMaterial({ color });

    const cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true;
    scene.add(cube);

    cube.position.x = x;
    cube.position.y = 1;

    return cube;
}

let lastTime = 0;
function render(time) {
    time *= 0.001;  // convert time to seconds
    const deltaTime = time - lastTime;
    lastTime = time;

    shapes.forEach((shape, ndx) => {
        const speed = 1 + ndx * .1;
        const rot = time * speed;
        shape.rotation.x = rot;
        shape.rotation.y = rot;
    });

    /// HEART ANIMATION ///
    // Change heart scale over time
    let heartScale = (Math.sin(time * 4) + Math.sin(time * 8) + 2.5);
    // Shrink it to be appropriately sized
    heartScale *= defaultHeartScale;
    // Average it's changing scale to make it smoother and less extreme
    heartScale = (heartScale + 7 * defaultHeartScale) / 8;
    // Set scale if heart asset is loaded
    if (heart) {
        if (heartScale) { heart.scale.set(heartScale, (heartScale + 0.15) / 4, heartScale); }
    }

    composer.render(deltaTime);

    requestAnimationFrame(render);
}

main();