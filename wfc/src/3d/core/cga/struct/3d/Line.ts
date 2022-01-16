import { v3, Vec3 } from "../../math/Vec3";
import { DistanceResult } from './result';

export class Line {

  direction: Vec3;
  constructor(public origin: Vec3 = v3(), public end: Vec3 = v3()) {
    this.direction = this.end
      .clone()
      .sub(this.origin)
      .normalize();
  }

  distancePoint(pt: any): DistanceResult {
    throw new Error("Method not implemented.");
  }

  //---距离-------------
  /**
   * 直线到直线的距离
   * 参数与最近点顺序一致
   * @param  {Line} line
   */
  distanceLine(line: Line) {
    var result: DistanceResult = {
      parameters: [],
      closests: []
    };
    var diff = this.origin.clone().sub(line.origin);
    var a01 = -this.direction.dot(line.direction);
    var b0 = diff.dot(this.direction);
    var s0, s1;
    if (Math.abs(a01) < 1) {
      var det = 1 - a01 * a01;
      var b1 = -diff.dot(line.direction);
      s0 = (a01 * b1 - b0) / det;
      s1 = (a01 * b0 - b1) / det;
    } else {
      s0 = -b0;
      s1 = 0;
    }
    result.parameters![0] = s0;
    result.parameters![1] = s1;
    result.closests![0] = this.direction
      .clone()
      .multiplyScalar(s0)
      .add(this.origin);
    result.closests![1] = line.direction
      .clone()
      .multiplyScalar(s1)
      .add(line.origin);
    diff = result.closests![0].clone().sub(result.closests![1]);
    result.distanceSqr = diff.dot(diff);
    result.distance = Math.sqrt(result.distanceSqr);

    return result;
  }
}

export function line(start?: Vec3, end?: Vec3) {
  return new Line(start, end);
}

