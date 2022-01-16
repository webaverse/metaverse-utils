import { Mesh, BufferGeometry, BufferAttribute, Matrix4, Raycaster, Material, Vector3, Quaternion, Euler, Box3, Shader, WebGLRenderer, InstancedBufferAttribute, InstancedBufferGeometry, Color } from 'three';
import { decompose, compose } from './instanced';
/**
* @author yszhao  
*/

const _instanceLocalMatrix = new Matrix4();
const _instanceWorldMatrix = new Matrix4();

const _instanceIntersects: any = [];

const _mesh = new Mesh();
let _lastOpIndex = -1;
const _v1 = new Vector3();
const _s1 = new Vector3();
const _m1 = new Matrix4();
const _q1 = new Quaternion();

export class InstancedMesh<
    TGeometry extends BufferGeometry = BufferGeometry,
    TMaterial extends Material | Material[] = Material | Material[]
    > extends Mesh<TGeometry, TMaterial>  {

    readonly isInstancedMesh: boolean = true;
    boundingBox: Box3 = new Box3();

    instanceMatrix: BufferAttribute;
    instanceColor: BufferAttribute | null;
    constructor(geometry: TGeometry,
        material: TMaterial, public count: number,
        private allowPick: boolean = true) {

        super(geometry, material);

        this.instanceMatrix = new BufferAttribute(new Float32Array(count * 16), 16);
        this.instanceColor = null;

        this.count = count;

        this.frustumCulled = false;
    }


    copy(source: any) {
        super.copy(source);

        this.instanceMatrix.copy(source.instanceMatrix);
        this.count = source.count;

        return this;

    }



    set(positions: Vector3[], rotations: Quaternion[], scales: Vector3[]) {
        if (positions.length !== this.count)
            console.warn("位置数量与模型数量不相等");
        for (let i = 0; i < this.count; i++) {
            _instanceLocalMatrix.compose(positions[i], rotations[i], scales[i]);
            this.setMatrixAt(i, _instanceLocalMatrix);
        }
    }


    getMatrixAt(index: number, matrix: Matrix4) {
        if (this.instanceMatrix)
            matrix.fromArray(this.instanceMatrix.array, index * 16);
    }

    getPositionAt(index: number, position?: Vector3) {
        if (!position) {
            console.log("position这个参数应该从外面传入，尽可能使用同一个对象，节约内存")
            position = new Vector3();
        }
        if (this.instanceMatrix) {
            if (index !== _lastOpIndex) {
                _instanceLocalMatrix.fromArray(this.instanceMatrix.array, index * 16);
                _lastOpIndex = index;
            }
            decompose(_instanceLocalMatrix, position)
        }
        return position;
    }

    getScaleAt(index: number, scale?: Vector3) {
        if (!scale) {
            console.warn("scale这个参数应该从外面传入，尽可能使用同一个对象，节约内存")
            scale = new Vector3();
        }
        if (this.instanceMatrix) {
            if (index !== _lastOpIndex) {
                _instanceLocalMatrix.fromArray(this.instanceMatrix.array, index * 16);
                _lastOpIndex = index;
            }

            decompose(_instanceLocalMatrix, undefined, undefined, scale)
        }
        return scale;
    }

    getQuaternionAt(index: number, quaternion?: Quaternion) {
        if (!quaternion) {
            console.warn("scale这个参数应该从外面传入，尽可能使用同一个对象，节约内存")
            quaternion = new Quaternion();
        }
        if (this.instanceMatrix) {
            if (index !== _lastOpIndex) {
                _instanceLocalMatrix.fromArray(this.instanceMatrix.array, index * 16);
                _lastOpIndex = index;
            }

            decompose(_instanceLocalMatrix, undefined, quaternion, undefined)
        }
        return quaternion;
    }




    raycast(raycaster: Raycaster, intersects: any[]) {

        var matrixWorld = this.matrixWorld;
        var raycastTimes = this.count;

        _mesh.geometry = this.geometry;
        _mesh.material = this.material;

        if (_mesh.material === undefined) return;

        for (var instanceId = 0; instanceId < raycastTimes; instanceId++) {


            this.getMatrixAt(instanceId, _instanceLocalMatrix);

            _instanceWorldMatrix.multiplyMatrices(matrixWorld, _instanceLocalMatrix);


            _mesh.matrixWorld = _instanceWorldMatrix;

            _mesh.raycast(raycaster, _instanceIntersects);


            for (var i = 0, l = _instanceIntersects.length; i < l; i++) {

                var intersect = _instanceIntersects[i];
                intersect.instanceId = instanceId;
                intersect.object = this;
                intersects.push(intersect);

            }

            _instanceIntersects.length = 0;

        }

    }

    computeBoundingBox() {
        this.geometry.computeBoundingBox();
    }

    setMatrixAt(index: number, matrix: Matrix4) {
        if (this.instanceMatrix)
            matrix.toArray(this.instanceMatrix.array, index * 16);
    }

    setPositionAt(index: number, position: Vector3 | number, y?: number, z?: number) {
        if (position instanceof Vector3) {
            _v1.copy(position)
        } else if (!isNaN(position)) {
            _v1.set(position, y!, z!);
        }
        if (this.instanceMatrix) {
            _m1.fromArray(this.instanceMatrix.array, index * 16);
            _m1.setPosition(_v1);
            _m1.toArray(this.instanceMatrix.array, index * 16);
            this.instanceMatrix.version++;
        }

    }

    setQuaternionAt(index: number, quaternion: Quaternion) {
        if (this.instanceMatrix) {
            _m1.fromArray(this.instanceMatrix.array, index * 16);
            _m1.decompose(_v1, _q1, _s1);
            _m1.compose(_v1, quaternion, _s1);
            _m1.toArray(this.instanceMatrix.array, index * 16);
        }

    }

    setScaleAt(index: number, scale: Vector3) {
        if (this.instanceMatrix) {
            _m1.fromArray(this.instanceMatrix.array, index * 16);
            _m1.decompose(_v1, _q1, _s1);
            _m1.compose(_v1, _q1, scale);
            _m1.toArray(this.instanceMatrix.array, index * 16);
        }

    }

    updateMorphTargets() {

    }

}

