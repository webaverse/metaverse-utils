import { Vec3 } from '../math/Vec3';
import { Vector3 } from 'three';
export function calcLineLength(points: Vector3[]) {
    var len = 0;
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        len += p0.distanceTo(p1)
    }
    return len;
}