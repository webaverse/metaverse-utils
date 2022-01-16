import { LineSegments, Object3D, BufferGeometry, Vector3, Texture, ExtrudeGeometry, Mesh, Shape, Vector2, TubeBufferGeometry, MeshBasicMaterial, DoubleSide, FrontSide, RepeatWrapping, BackSide, MeshPhongMaterial, RGBAFormat, MeshLambertMaterial } from 'three';
import { extrudeToMesh } from '../core/cga/extends/threeaid';
import { Vec3 } from '../core/cga/math/Vec3';
import { GraphDevice } from '../graphdevice';

export class Luxian extends Object3D {
    linesegments: Vector3[][][];
    constructor(gd: GraphDevice, map: Texture, object: Object3D) {
        super();
        // object.updateMatrixWorld(true);
        var linesegments = []
        for (let i = 0; i < object.children.length; i++) {
            var linesegment = []
            const ls = object.children[i] as LineSegments;
            ls.geometry.applyMatrix4(ls.matrixWorld)
            for (let i = 0; i < (ls.geometry as BufferGeometry).attributes.position.array.length; i += 6) {
                const x = (ls.geometry as BufferGeometry).attributes.position.array[i];
                const y = (ls.geometry as BufferGeometry).attributes.position.array[i + 1];
                const z = (ls.geometry as BufferGeometry).attributes.position.array[i + 2];
                const x1 = (ls.geometry as BufferGeometry).attributes.position.array[i + 3];
                const y1 = (ls.geometry as BufferGeometry).attributes.position.array[i + 4];
                const z1 = (ls.geometry as BufferGeometry).attributes.position.array[i + 5];
                linesegment.push([new Vector3(x, y, z), new Vector3(x1, y1, z1)]);
            }
            linesegments.push(linesegment);
        }

        this.linesegments = linesegments;
        var lines = this.linesegments.map(e => this.composeLine(e))

        // this.frustumCulled = false;
        var section = [new Vec3(-0.25, 0, 0), new Vec3(0.25, 0, 0)]
        map.wrapS = RepeatWrapping;
        map.wrapT = RepeatWrapping;
        map.rotation = Math.PI / 2;
        map.repeat.set(1 / 200, 2);
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const mapclone = map.clone();
            mapclone.needsUpdate = true;
            const material = new MeshLambertMaterial({
                depthTest: false,
                transparent: true,
                map: mapclone,
                side: DoubleSide,
                emissiveMap: mapclone
            });
            var lineMesh = extrudeToMesh(section, line, { isClosed2: false, isClosed: false }, material);

            (lineMesh as any).speed = Math.random() * 1 + 1;
            this.add(lineMesh);
        }

        gd.on('update', () => {
            for (let i = 0; i < this.children.length; i++) {
                const element: any = this.children[i];
                element.material.map.needsUpdate = true;
                element.material.map.offset.x -= 0.003 * (element as any).speed;
            }
        })

        this.position.y = 0.3;

    }

    composeLine(ls: Vector3[][]): Vector3[] {
        var lines = [ls.shift()!];

        for (let i = 0; i < ls.length; i++) {
            var seg: Vector3[] = ls[i];
            if (seg[0].equals(lines[0][0])) {
                lines.unshift(seg.reverse());
                ls.splice(i, 1);
                i = -1;
            } else if (seg[1].equals(lines[0][0])) {
                lines.unshift(seg);
                ls.splice(i, 1);
                i = -1;
            } else if (seg[0].equals(lines[lines.length - 1][1])) {
                lines.push(seg);
                ls.splice(i, 1);
                i = -1;
            } else if (seg[1].equals(lines[lines.length - 1][1])) {
                lines.push(seg.reverse());
                ls.splice(i, 1);
                i = -1;
            }
        }

        var line = [lines[0][0]]
        lines.forEach(e => line.push(e[1]));
        return line;
    }



}