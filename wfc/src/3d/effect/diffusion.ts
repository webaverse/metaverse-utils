import { Mesh, Sprite } from 'three';
import { GraphDevice } from '../graphdevice';
import { Dynamic } from './dynamic';
export class Diffusion extends Dynamic {
    isPlay: boolean = true;
    constructor(gd: GraphDevice) {
        super(gd);

        gd.on('update', () => {
            if (this.isPlay)
                this.update();
        });
    }

    update() {

    }


}