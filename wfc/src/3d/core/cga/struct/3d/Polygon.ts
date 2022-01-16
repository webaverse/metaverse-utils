
import { Vec3 } from '../../math/Vec3';
import { Segment } from './Segment';
import { DistanceResult } from './result';
import { Polyline } from './PolyLine';

export class Polygon extends Polyline {
    isPolygon: boolean = true;
    constructor(vs?: any[]) {
        super(vs);
    }

    offset(distance: number, normal: Vec3 = Vec3.UnitY): Polygon {

        const segments = [];
        for (let i = 0; i < this.length; i++) {
            const point = this[i];
            const pointNext = this[(i + 1) % this.length];
            const segment = new Segment(point, pointNext)
            segments.push(segment)
            segment.offset(distance, normal);
        }

        for (let i = 0; i < this.length; i++) {
            const seg = segments[i];
            const segNext = segments[(i + 1)];
            const result: DistanceResult = (seg as any).distanceLine(segNext as any);
            seg.p1 = result.closests[0]
            segNext.p0 = result.closests[1];
        }

        for (let i = 0; i < this.length; i++) {
            const seg = segments[i];

        }

        return new Polygon();
    }

    containPoint(point: Vec3) {

    }


}

/**
 * robust 识别出点集或者多边形的法线
 * @param {Polygon|Array<Point|Vector3>} points 
 * @returns {Vector3} 法线
 */
export function recognitionPolygonNormal(points: Vec3[]) {
    var len = points.length

    var minV = +Infinity
    var minVIndex = -1
    for (let i = 0; i < len + 2; i++) {
        var p0 = points[i % len];
        var p1 = points[(i + 1) % len];
        var p2 = points[(i + 2) % len];
        var dotv = Math.abs(p1.clone().sub(p0).normalize().dot(p2.clone().sub(p1).normalize()));
        if (minV > dotv) {
            dotv = minV;
            minVIndex = i;
        }
    }
    var p0 = points[(minVIndex - 1 + len) % len];
    var p1 = points[(minVIndex) % len];
    var p2 = points[(minVIndex + 1) % len];
    return p1.clone().sub(p0).cross(p2.clone().sub(p1)).normalize();

}