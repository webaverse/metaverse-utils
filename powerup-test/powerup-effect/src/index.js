import _ from 'lodash';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Nebula, { SpriteRenderer, GPURenderer } from "three-nebula";
import json from "./my-particle-system.json";
import powerupVertexShaderString from './powerup.vert';
import powerupFragmentShaderString from './powerup.frag';

let scene;
let camera;
let renderer;
let nebula;
let clock;
let time = 1;

camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.z = 70;
camera.position.y = 70;
scene = new THREE.Scene();

renderer = new THREE.WebGLRenderer();

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor("black");

document.body.appendChild(renderer.domElement);

clock = new THREE.Clock();

var controls = new OrbitControls(camera, renderer.domElement);

var texture = new THREE.TextureLoader().load('gas.jpeg');

texture.wrapS = THREE.RepeatWrapping;

// var material = new THREE.ShaderMaterial({
//     uniforms: {
//         t: { value: 1.0 },
//         flameTex: { type: "t", value: texture },
//         index: { value: 0 }
//     },
//     side: THREE.DoubleSide,
//     transparent: true,
//     depthTest: false,
//     vertexShader: powerupVertexShaderString,
//     fragmentShader: powerupFragmentShaderString
// });

var flameMaterials = [];

_(_.range(4)).each(i => {
    var frontMaterial = new THREE.ShaderMaterial({
        uniforms: {
            t: { value: 1.0 },
            flameTex: { type: "t", value: texture },
            index: { value: i }
        },
        side: THREE.FrontSide,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        vertexShader: powerupVertexShaderString,
        fragmentShader: powerupFragmentShaderString
    });

    var frontMesh = new THREE.Mesh(
        new THREE.LatheGeometry(_(_.range(10)).map(
            i => new THREE.Vector2(10, 10 * i)).value()),
        frontMaterial,
    );

    frontMesh.renderOrder = 20 - i;

    flameMaterials.push(frontMaterial);

    scene.add(frontMesh);

    var backMaterial = new THREE.ShaderMaterial({
        uniforms: {
            t: { value: 1.0 },
            flameTex: { type: "t", value: texture },
            index: { value: i }
        },
        side: THREE.BackSide,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        vertexShader: powerupVertexShaderString,
        fragmentShader: powerupFragmentShaderString
    });

    var backMesh = new THREE.Mesh(
        new THREE.LatheGeometry(_(_.range(10)).map(
            i => new THREE.Vector2(10, 10 * i)).value()),
        backMaterial,
    );

    backMesh.renderOrder = 10 + i;

    flameMaterials.push(backMaterial);

    scene.add(backMesh);

});

// material.uniformsNeedUpdate = true;

// const lathe1 = new THREE.Mesh(
//     new THREE.LatheGeometry(_(_.range(10)).map(
//         i => new THREE.Vector2(5 * i + 10, 0.5 * i)).value()),
//     material
// );

// scene.add( lathe1 );

// const lathe2 = new THREE.Mesh(
//     new THREE.LatheGeometry( _(_.range(10)).map(
//         i => new THREE.Vector2(1.2 * i + 10, 10 * i)).value()),
//     material
// );

// scene.add( lathe2 );

var emitterString = JSON.stringify(json.emitters[0]);

_(_.range(9)).each(i => {
    json.emitters.push(JSON.parse(emitterString));
});

_(json.emitters).each((e, i) => {
    e.position.x = 10 * Math.cos(i * Math.PI * 2 / 10);
    e.position.z = 10 * Math.sin(i * Math.PI * 2 / 10);
});

Nebula.fromJSONAsync(json, THREE).then(loaded => {
    const nebulaRenderer = new GPURenderer(scene, THREE);

    nebula = loaded.addRenderer(nebulaRenderer);

    animate();
});

function animate() {
    requestAnimationFrame(animate);

    _(flameMaterials).each(m => m.uniforms.t = { value: clock.getElapsedTime() });
    // material.uniforms.t = { value: clock.getElapsedTime() };

    nebula.update();
    renderer.render(scene, camera);

    // console.log(">>> calls: ", renderer.info.render.calls);
}
