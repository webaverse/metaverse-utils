import { Mesh, Object3D, Sprite } from 'three';
import { GraphDevice } from '../graphdevice';

export abstract class Dynamic extends Object3D {
    isPlay: boolean = false;
    object: Mesh | Sprite | any;
    constructor(gd: GraphDevice) {
        super();
        this.add(this.object);
        gd.on('update', () => {
            if (this.isPlay)
                this.update
        })
    }

    abstract update(): void;

}