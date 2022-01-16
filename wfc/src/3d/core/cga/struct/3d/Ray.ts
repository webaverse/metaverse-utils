import { Vec3 } from '../../math/Vec3';
import { Segment } from './Segment';
import { DistanceResult } from './result';
export class Ray {
    origin: Vec3;
    direction: Vec3;
    constructor(origin: Vec3, direction: Vec3) {
        this.origin = origin;
        this.direction = direction.normalize();
    }

    /**
     * 射线到线段的距离
     * @param segment 
     */
    distanceSegment(segment: Segment): DistanceResult {

        const result: DistanceResult = {
            parameters: [],
            closests: []
        };

        // segment.GetCenteredForm(segCenter, segDirection, segExtent);
        var segCenter = segment.center;
        var segDirection = segment.direction;
        var segExtent = segment.extent * 0.5;

        var diff = this.origin.clone().sub(segCenter);
        var a01 = - this.direction.dot(segDirection);
        var b0 = diff.dot(this.direction);
        var s0, s1;

        if (Math.abs(a01) < 1) {
            // The ray and segment are not parallel.
            var det = 1 - a01 * a01;
            var extDet = segExtent * det;
            var b1 = - diff.dot(segDirection);
            s0 = a01 * b1 - b0;
            s1 = a01 * b0 - b1;

            if (s0 >= 0) {
                if (s1 >= -extDet) {
                    if (s1 <= extDet)  // region 0
                    {
                        // Minimum at interior points of ray and segment.
                        s0 /= det;
                        s1 /= det;
                    }
                    else  // region 1
                    {
                        s1 = segExtent;
                        s0 = Math.max(-(a01 * s1 + b0), 0);
                    }
                }
                else  // region 5
                {
                    s1 = -segExtent;
                    s0 = Math.max(-(a01 * s1 + b0), 0);
                }
            }
            else {
                if (s1 <= -extDet)  // region 4
                {
                    s0 = -(-a01 * segExtent + b0);
                    if (s0 > 0) {
                        s1 = -segExtent;
                    }
                    else {
                        s0 = 0;
                        s1 = -b1;
                        if (s1 < -segExtent) {
                            s1 = -segExtent;
                        }
                        else if (s1 > segExtent) {
                            s1 = segExtent;
                        }
                    }
                }
                else if (s1 <= extDet)  // region 3
                {
                    s0 = 0;
                    s1 = -b1;
                    if (s1 < -segExtent) {
                        s1 = -segExtent;
                    }
                    else if (s1 > segExtent) {
                        s1 = segExtent;
                    }
                }
                else  // region 2
                {
                    s0 = -(a01 * segExtent + b0);
                    if (s0 > 0) {
                        s1 = segExtent;
                    }
                    else {
                        s0 = 0;
                        s1 = -b1;
                        if (s1 < -segExtent) {
                            s1 = -segExtent;
                        }
                        else if (s1 > segExtent) {
                            s1 = segExtent;
                        }
                    }
                }
            }
        }
        else {
            // Ray and segment are parallel.
            if (a01 > 0) {
                // Opposite direction vectors.
                s1 = -segExtent;
            }
            else {
                // Same direction vectors.
                s1 = segExtent;
            }

            s0 = Math.max(-(a01 * s1 + b0), 0);
        }

        result.parameters[0] = s0;
        result.parameters[1] = s1;
        result.closests[0] = this.direction.clone().multiplyScalar(s0).add(this.origin);
        result.closests[1] = segDirection.clone().multiplyScalar(s1).add(segCenter);
        diff = result.closests[0].clone().sub(result.closests[1]);
        result.distanceSqr = diff.dot(diff);
        result.distance = Math.sqrt(result.distanceSqr);
        return result;
    }
}