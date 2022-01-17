import { Object3D, Mesh, PlaneBufferGeometry, MeshBasicMaterial, Texture, DoubleSide, RepeatWrapping, FrontSide } from 'three';
import { GraphDevice } from '../graphdevice';

export class Starfall extends Object3D {
    constructor(gd: GraphDevice, map: Texture) {
        super();
        const geometry = new PlaneBufferGeometry(2, 40);
        geometry.translate(0, 20, 0)
        map.repeat.set(1, 1);
        map.rotation = Math.PI / 2;
        map.wrapS = RepeatWrapping;
        map.wrapT = RepeatWrapping;

        for (let i = 0; i < 10; i++) {
            const material = new MeshBasicMaterial({ depthTest: false, transparent: true, side: DoubleSide, map: map.clone() });

            const fall = new Mesh(geometry, material);
            fall.position.x = Math.random() * 100 - 50;
            fall.position.z = Math.random() * 100 - 50;
            fall.rotation.y = Math.PI * 2 * Math.random();
            (fall as any).speed = Math.random() * 2 + 1;
            this.add(fall);
        }

        gd.on('update', () => {
            for (let i = 0; i < this.children.length; i++) {
                const element: any = this.children[i];
                element.material.map.needsUpdate = true;
                element.material.map.offset.x -= 0.005 * element.speed;
            }
        })
    }
}