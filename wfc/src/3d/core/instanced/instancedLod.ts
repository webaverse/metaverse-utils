import { Object3D, LOD, Camera, InstancedBufferGeometry, Material, Vector3 } from 'three';
import { debounce } from "../utils";
import { InstancedMesh } from "./instancedmesh";
// import { kdTree } from '../datastruct/kdtree';

interface LevelData {
    distance: number;//显示距离
    count: number;//显示数量
    instanced: InstancedMesh;
}

export enum OptimizeType {
    Comon,
    Strip,
    Plane,
    Cube
}
const distanceFunction = (a: any, b: any) => {

    return Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2) + Math.pow(a[2] - b[2], 2);

};

export class InstancedLod extends Object3D {
    levels: LevelData[] = [];
    delay: number = 300;
    count: number;
    debounceUpdate: (...args: any) => void;
    positions: any = [];
    // kdtree: kdTree;
    buffarray: Float32Array;
    constructor(public points: Vector3[]) {
        super();
        this.count = this.points.length;
        this.debounceUpdate = debounce(this.update, this.delay);
        this.buffarray = new Float32Array(this.points.length * 4);
        // this.kdtree = new kdTree(this.buffarray, distanceFunction, 0);
    }

    addLevel(geometry: InstancedBufferGeometry, material: Material, distance: number, count: number) {
        const instancedmesh = new InstancedMesh(geometry, material, count);
        this.add(instancedmesh);

        let l = 0;
        for (; l < this.levels.length; l++) {
            if (distance < this.levels[l].distance)
                break;
        }

        this.levels.splice(l, 0, {
            instanced: instancedmesh,
            distance: distance,
            count
        })

        return this;
    }

    update(camera: Camera) {
        const cameraPositon = camera.position;
        for (let o = 0; o < this.levels.length; o++) {
            const level: LevelData = this.levels[o];

        }
        // this.kdtree.nearest()
    }
}