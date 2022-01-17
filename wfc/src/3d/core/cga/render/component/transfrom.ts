import { Component } from "./component";
import { Vec3 } from "../../math/Vec3";
import { Euler } from "../../math/Euler";
import { Quat } from "../../math/Quat";
import { Mat4 } from "../../math/Mat4";

export class TransfromComponent extends Component {
    private _position: Vec3 = new Vec3();
    private _scale: Euler = new Euler();
    private _rotation: Vec3 = new Vec3();
    private _quat: Quat = new Quat();
    private _matrix: Mat4 = new Mat4();
    private _matrixWorld: Mat4 = new Mat4();
    constructor() {
        super();

    }



    updateMatrix() {
        this._matrix.compose(this._position, this._quat, this._scale);
    }

    updateMatrixWorld(parent: TransfromComponent) {
        this._matrixWorld.copy(this._matrix).premultiply(parent._matrixWorld);
    }
}