import { CircleBufferGeometry, Object3D, MeshBasicMaterial, Mesh, SphereBufferGeometry, DoubleSide, PlaneBufferGeometry, Sprite, SpriteMaterial } from 'three';
import { GraphDevice } from '../graphdevice';
import { Asset } from '../Asset'; 
import { Timer } from '../../of';

export class Dipan extends Object3D {
    constructor(private gd: GraphDevice) {
        super();

        var map = Asset.Instanced.loadTexture("./texture/circular_03.png")

        var center = new Mesh(new PlaneBufferGeometry(1, 1), new MeshBasicMaterial({ map, transparent: true }))
        center.geometry.rotateX(-Math.PI / 2)
        this.add(center);
        gd.on('update', (time: Timer) => {

            center.rotation.y += 0.01;

        })
    }




}