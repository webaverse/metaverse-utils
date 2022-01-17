import _ from 'lodash';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { MuzzleFlashDemo } from './muzzleFlashDemo.js';
import { ShipTrail } from './shipTrail';


let scene, camera, renderer, clock;
let demo;
let shipTrail;
let mesh;


function init() {

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 50;

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor("black");

    document.body.appendChild(renderer.domElement);

    var controls = new OrbitControls(camera, renderer.domElement);

    clock = new THREE.Clock();

}

function setupScene() {

	mesh = new THREE.Mesh(
		new THREE.BoxGeometry(), new THREE.MeshBasicMaterial({ color: 0xff0000 })
	);

    scene.add(mesh);

    // demo = new MuzzleFlashDemo();

    // scene = demo.initScene();

    shipTrail = new ShipTrail();

	scene.add(shipTrail);
    scene.add(shipTrail.batchRenderer);

}

function animate() {

    requestAnimationFrame(animate);

    var delta = clock.getDelta();

    // demo.render(delta);

    shipTrail.update(delta);

    shipTrail.position.z -= 0.5;
    shipTrail.position.z =  shipTrail.position.z % 50;
    mesh.position.z = shipTrail.position.z;
    // shipTrail.position.y += Math.random() - 0.5;

    renderer.render(scene, camera);

    console.log(">>> calls: ", renderer.info.render.calls);

}

(function (){

    init();
    setupScene();
    animate();

})();
