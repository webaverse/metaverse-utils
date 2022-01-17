import _ from 'lodash';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import dashVertexShaderString from './dash.vert';
import dashFragmentShaderString from './dash.frag';

let scene, camera, renderer, clock;
let time = 1;

let dashMaterial;

function init() {

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 10;
    // camera.position.y = 70;
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor("black");

    document.body.appendChild(renderer.domElement);

    clock = new THREE.Clock();

    var controls = new OrbitControls(camera, renderer.domElement);

}

function setupScene() {

    let sphereVertexCount = 10;
    let trailVertexCount = 10;

    let latheVertices = [];

    latheVertices.push(..._().range(sphereVertexCount).map(i => {
        let theta = Math.PI / 2 - Math.PI / 2 / sphereVertexCount * i;
        return new THREE.Vector2( Math.cos(theta), Math.sin(theta));
    }).value());

    latheVertices.push(..._().range(trailVertexCount).map(i => new THREE.Vector2(
        1 - 0.04 * i, -0.5 * i
    )).value());

    let flameTexture = new THREE.TextureLoader().load('./gas.jpeg');
    flameTexture.wrapS = THREE.RepeatWrapping;

    dashMaterial = new THREE.ShaderMaterial({
        uniforms: {
            flameTex: { type: 't', value: flameTexture },
            t: { value: 0 }
        },
        transparent: true,
        side: THREE.DoubleSide,
        depthTest: false,
        vertexShader: dashVertexShaderString,
        fragmentShader: dashFragmentShaderString
    });

    let lathe = new THREE.Mesh(new THREE.LatheGeometry(latheVertices), new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }));

    scene.add(lathe);

}

function animate() {

    requestAnimationFrame(animate);

    dashMaterial.uniforms.t = { value: clock.getElapsedTime() };

    renderer.render(scene, camera);

}

(function () {

    init();

    setupScene();

    animate();

})();
