import { LineSegments, Object3D, Vector3, BufferGeometry, LineBasicMaterial, Line } from 'three';
import { GraphDevice } from '../graphdevice';
import { HTMLGLLabel, LabelType } from './label';

export class SideLabel extends Object3D {
    longlat: Vector3 = new Vector3;
    constructor(gd: GraphDevice, object: LineSegments) {
        super();
        var linesegment = []
        const ls = object;
        for (let i = 0; i < (ls.geometry as BufferGeometry).attributes.position.array.length; i += 6) {
            const x = (ls.geometry as BufferGeometry).attributes.position.array[i];
            const y = (ls.geometry as BufferGeometry).attributes.position.array[i + 1];
            const z = (ls.geometry as BufferGeometry).attributes.position.array[i + 2];
            const x1 = (ls.geometry as BufferGeometry).attributes.position.array[i + 3];
            const y1 = (ls.geometry as BufferGeometry).attributes.position.array[i + 4];
            const z1 = (ls.geometry as BufferGeometry).attributes.position.array[i + 5];
            linesegment.push([new Vector3(x, y, z), new Vector3(x1, y1, z1)]);
        }


        var lines = this.composeLine(linesegment);
        lines.forEach((e: Vector3) => { e.applyMatrix4(ls.matrixWorld) });
        lines.sort((a, b) => a.y - b.y)
        for (let i = lines[1].y, j = 0; i <= lines[2].y; i += 16, j += 4) {
            var label = new HTMLGLLabel(gd, `<div style="position: absolute;  border: 1px solid rgba(171, 198, 255, 0.8);background-color: rgba(4, 84, 255, 0.15);">
            <div style=" font-size: 200px; white-space: nowrap;color: #ffffff;">
                ${j + 3}F
            </div>
            </div>`, LabelType.Sprite);
            label.position.copy(lines[1])
            label.position.y += i;
            label.width = 4;
            label.height = 4;
            label.rotateY(-Math.PI / 2)
            this.add(label);

        }
        var geome = new BufferGeometry();
        // geome.vertices = lines;
        // this.add(new Line(geome, new LineBasicMaterial({ color: 0xff0077, transparent: true, opacity: 0.3 })))
        // this.longlat = new Vector3(lines[1].x, lines[1].y, lines[1].z);
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