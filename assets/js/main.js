import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const manager = new THREE.LoadingManager();

let camera, scene, renderer, stats, object, loader, guiMorphsFolder;
let mixer;

const timer = new THREE.Timer();
timer.connect(document);

const params = {
    asset: 'Samba Dancing'
};

const assets = [
    'Samba Dancing',
    'morph_test',
    'monkey',
    'monkey_embedded_texture',
    'vCube',
];

init();

function init() {

    // ✅ USAR EL CONTENEDOR DEL HTML
    const container = document.getElementById('container');

    const width = container.clientWidth;
    const height = container.clientHeight;

    camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
    camera.position.set(100, 200, 300);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);
    scene.fog = new THREE.Fog(0xa0a0a0, 200, 1000);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 5);
    hemiLight.position.set(0, 200, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 5);
    dirLight.position.set(0, 200, 100);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // suelo
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2000, 2000),
        new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add(mesh);

    const grid = new THREE.GridHelper(2000, 20);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);

    loader = new FBXLoader(manager);
    loadAsset(params.asset);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.setAnimationLoop(animate);
    renderer.shadowMap.enabled = true;

    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 100, 0);
    controls.update();

    window.addEventListener('resize', onWindowResize);

    stats = new Stats();
    container.appendChild(stats.dom);

    const gui = new GUI();
    gui.add(params, 'asset', assets).onChange(loadAsset);

    guiMorphsFolder = gui.addFolder('Morphs').hide();
}

function loadAsset(asset) {

    loader.load('./assets/models/fbx/' + asset + '.fbx', function (group) {

        if (object) {
            scene.remove(object);
        }

        object = group;

        if (object.animations && object.animations.length) {
            mixer = new THREE.AnimationMixer(object);
            mixer.clipAction(object.animations[0]).play();
        }

        scene.add(object);
    });

}

function onWindowResize() {

    const container = document.getElementById('container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

function animate() {

    timer.update(); // 🔥 ESTA LÍNEA ES CLAVE

    const delta = timer.getDelta();

    if (mixer) mixer.update(delta);

    renderer.render(scene, camera);

    stats.update();
}