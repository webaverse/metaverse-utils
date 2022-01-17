import { Vector3 } from "three";

/*
 * @Description  :
 * @Author       : 赵耀圣
 * @QQ           : 549184003
 * @Date         : 2021-04-28 16:30:02
 * @LastEditTime : 2021-04-28 16:39:12
 * @FilePath     : \iot\src\3d\cameraStat.ts
 */
export class CameraStat {
    position: Vector3 = new Vector3();
    target: Vector3 = new Vector3();
    up: Vector3 = new Vector3();
    constructor() {

    }

    setControl(ctrl: any) {
        ctrl.object.position.copy(this.position)
        ctrl.target.copy(this.target)
        ctrl.update();
    }

    save(ctrl: any) {
        this.position.copy(ctrl.object.position)
        this.target.copy(ctrl.target)
    }
}