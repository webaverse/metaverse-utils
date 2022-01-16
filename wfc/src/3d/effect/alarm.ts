import { CircleBufferGeometry, Object3D, MeshBasicMaterial, Mesh, SphereBufferGeometry, DoubleSide, PlaneBufferGeometry, Sprite, SpriteMaterial, ShaderLib } from 'three';
import { GraphDevice } from '../graphdevice';
import { Asset } from '../Asset'; 
import { Timer } from '../../of';

const map = Asset.Instanced.loadTexture("./texture/ball_light_01.png")
export class AlarmLight extends Object3D {
    constructor(private gd: GraphDevice) {
        super();

        var center = new Sprite(new SpriteMaterial({ map, color: 0xff0000, transparent: true, depthTest: false, sizeAttenuation: true }))

        this.add(center);

        var sprite = new Sprite(new SpriteMaterial({ map, color: 0xff0000, transparent: true, depthTest: false, sizeAttenuation: true }))

        this.add(sprite);
        const that = this
        gd.on('update', (time: Timer) => {
            if (!that.visible)
                return;

            center.scale.x += 2 * time.delta;
            center.scale.y += 2 * time.delta;
            center.scale.z += 2 * time.delta;
            if (center.scale.x > 5) {
                center.scale.x = 1;
                center.scale.y = 1;
                center.scale.z = 1;
            }

        });
    }




}