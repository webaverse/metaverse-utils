import { LineSegments, Object3D, BufferGeometry, Vector3 } from 'three';
import { GraphDevice } from '../graphdevice';
import { CanvasLabel } from './canvasLabel';

const chatab: any = { 1: 'A', 2: 'B', 3: 'C' }
export class TopLabel extends Object3D {
    constructor(gd: GraphDevice, object: LineSegments, part: number, unit: number) {
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

        // 1栋A单元
        var lines = this.composeLine(linesegment);
        lines.forEach((e: Vector3) => { e.applyMatrix4(ls.matrixWorld) });
        var bianhao = '';
        if (unit > 0)
            bianhao = `${part}号楼${chatab[unit]}单元`;
        else
            bianhao = `${part}号楼`;

        // var label = new HTMLGLLabel(gd, `<div style="position: absolute;  overflow: hidden; border: 1px solid rgba(171, 198, 255, 0.8);background-color: rgba(4, 84, 255, 0.15);">
        // <div style=" font-size: 200px;
        // line-height: 200px; white-space: nowrap;color: #ffffff;margin:10px">
        //     ${bianhao}
        // </div>
        // </div>`, LabelType.Mesh);
        // label.position.copy(lines[1])
        // label.width = 3 * bianhao.length;
        // label.height = 4;
        // label.rotateY(-Math.PI / 2)
        var label = new CanvasLabel();
        label.position.copy(lines[1])
        label.width = 3 * bianhao.length;
        label.height = 4;
        label.text = bianhao;
        label.rotateY(-Math.PI / 2);
        label.scale.multiplyScalar(4);

        this.add(label);


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