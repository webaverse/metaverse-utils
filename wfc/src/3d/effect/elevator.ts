import { Timer } from '../../of/core/timer';
import { BoxBufferGeometry, Object3D, Mesh, MeshBasicMaterial, CylinderBufferGeometry } from 'three';
import { GraphDevice } from '../graphdevice';
import { AlarmLight } from './alarm';

export class Elevator extends Object3D {
    _bad: boolean = false;
    private _eleBox: Mesh<BoxBufferGeometry, MeshBasicMaterial>;
    _selected: boolean = false;
    alarm: AlarmLight;
    constructor(private gd: GraphDevice) {
        super();
        var eleBox = this._eleBox = new Mesh(new BoxBufferGeometry(1.1, 3, 1.1), new MeshBasicMaterial({ color: 0xffaa55 }));
        eleBox.name = 'elevator-box'
        eleBox.geometry.translate(0, 1.5, 0);
        this.add(eleBox);

        var eleBoxSele1 = new Mesh(eleBox.geometry, new MeshBasicMaterial({}));
        eleBoxSele1.name = 'elevator-selected';
        eleBoxSele1.visible = false;
        eleBoxSele1.scale.set(1.5, 1.5, 1.5);
        eleBox.add(eleBoxSele1);


        var alarm = this.alarm = new AlarmLight(gd);
        alarm.position.y = 1.05;
        alarm.scale.multiplyScalar(5)
        alarm.visible = false;
        eleBox.add(alarm);

        var line = new Mesh(new CylinderBufferGeometry(0.05, 0.05, 1), new MeshBasicMaterial({ color: 0xaaaa55 }));
        line.geometry.translate(0, 0.5, 0);
        line.name = 'elevator-line';
        line.scale.y = 65;
        this.add(line);
        var speed = 0.1 * Math.random() + 0.025;
        gd.on('update', (time: Timer) => {
            if (this._bad)
                return;
            eleBox.position.y += speed;
            if (eleBox.position.y > 64)
                speed = - Math.abs(speed);

            if (eleBox.position.y < 1)
                speed = Math.abs(speed);
        })

    }

    set bad(val: boolean) {
        if (this._bad === val)
            return;
        this._bad = val;
        if (val) {
            this.alarm.visible = true;
            this._eleBox.material.color.set(0xff0000)
        } else {
            this.alarm.visible = false;
            this._eleBox.material.color.set(0xffaa55)
        }
    }

    set selected(val: boolean) {
        if (this._selected === val)
            return;
        this._selected = val;
        if (val) {
            this._eleBox.scale.set(1.5, 1.5, 1.5)
            this._eleBox.material.color.set(0xffffff)
        } else {
            this._eleBox.scale.set(1, 1, 1);
            if (this._bad) {
                this._eleBox.material.color.set(0xff0000)
            } else {
                this._eleBox.material.color.set(0xffaa55)
            }
        }
    }

    set size(val: number) {
        this.alarm.scale.multiplyScalar(val);
    }

}