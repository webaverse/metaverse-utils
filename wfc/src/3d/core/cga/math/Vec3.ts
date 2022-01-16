import { Quat, quat } from './Quat';
import { Mat3 } from './Mat3';
import { Mat4 } from './Mat4';
import { clamp } from './Math';
import { euler, Euler } from './Euler';
import { ResultDistance } from '../alg/result';
import { Line, line } from '../struct/3d/Line';
import { Ray } from '../struct/3d/Ray';
import { Segment } from '../struct/3d/Segment';
import { Plane } from '../struct/3d/Plane';
import { buildAccessors } from '../render/thing';
import { EventHandler } from '../render/eventhandler';
import { Polyline } from './Polyline';
import { IDistanceResut } from '../struct/3d/Path';

export class Vec3 extends EventHandler {
  x!: number;
  y!: number;
  z!: number;
  constructor(private _x: number = 0, private _y: number = 0, private _z: number = 0) {
    super();

    buildAccessors(['x', 'y', 'z'], this);

  }
  static isVec3(v: any) {
    return !isNaN(v.x) && !isNaN(v.y) && !isNaN(v.z) && isNaN(v.w);
  }


  get isVec3() { return true; }

  static get Up() {
    return new Vec3(0, 1, 0);
  }

  static get Down() {
    return new Vec3(0, 1, 0);
  }

  static get UnitX() {
    return new Vec3(1, 0, 0);
  }
  static get UnitY() {
    return new Vec3(0, 1, 0);
  }
  static get UnitZ() {
    return new Vec3(0, 0, 1);
  }

  set(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  setScalar(scalar: number) {
    this.x = scalar;
    this.y = scalar;
    this.z = scalar;

    return this;
  }

  setComponent(index: number, value: number) {
    switch (index) {
      case 0:
        this.x = value;
        break;
      case 1:
        this.y = value;
        break;
      case 2:
        this.z = value;
        break;
      default:
        throw new Error("index is out of range: " + index);
    }

    return this;
  }

  getComponent(index: number) {
    switch (index) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      default:
        throw new Error("index is out of range: " + index);
    }
  }

  clone(): Vec3 {
    return new Vec3(this.x, this.y, this.z);
  }

  copy(v: Vec3) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;

    return this;
  }

  add(v: Vec3, w?: Vec3) {
    if (w !== undefined) {
      console.warn(
        "Vec3: .add() now only accepts one argument. Use .addVecs( a, b ) instead."
      );
      return this.addVecs(v, w);
    }

    this.x += v.x;
    this.y += v.y;
    this.z += v.z;

    return this;
  }

  addScalar(s: number) {
    this.x += s;
    this.y += s;
    this.z += s;

    return this;
  }

  addVecs(a: Vec3, b: Vec3) {
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    this.z = a.z + b.z;

    return this;
  }

  addScaledVec(v: Vec3, s: number) {
    this.x += v.x * s;
    this.y += v.y * s;
    this.z += v.z * s;

    return this;
  }

  sub(v: Vec3, w?: Vec3) {
    if (w !== undefined) {
      console.warn(
        "Vec3: .sub() now only accepts one argument. Use .subVecs( a, b ) instead."
      );
      return this.subVecs(v, w);
    }

    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;

    return this;
  }

  subScalar(s: number) {
    this.x -= s;
    this.y -= s;
    this.z -= s;

    return this;
  }

  subVecs(a: Vec3, b: Vec3) {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    this.z = a.z - b.z;

    return this;
  }

  multiply(v: Vec3, w: Vec3) {
    if (w !== undefined) {
      return this.multiplyVecs(v, w);
    }

    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;

    return this;
  }

  multiplyScalar(scalar: number) {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;

    return this;
  }

  multiplyVecs(a: Vec3, b: Vec3) {
    this.x = a.x * b.x;
    this.y = a.y * b.y;
    this.z = a.z * b.z;

    return this;
  }

  applyEuler(euler: Euler) {
    if (!(euler && euler.isEuler)) {
      console.error(
        "Vec3: .applyEuler() now expects an Euler rotation rather than a Vec3 and order."
      );
    }

    return this.applyQuat(_quat.setFromEuler(euler));
  }

  applyAxisAngle(axis: any, angle: any) {
    return this.applyQuat(_quat.setFromAxisAngle(axis, angle));
  }

  applyMat3(m: Mat3) {
    var x = this.x,
      y = this.y,
      z = this.z;
    var e = m.elements;

    this.x = e[0] * x + e[3] * y + e[6] * z;
    this.y = e[1] * x + e[4] * y + e[7] * z;
    this.z = e[2] * x + e[5] * y + e[8] * z;

    return this;
  }

  applyMat4(m: Mat4) {
    var x = this.x,
      y = this.y,
      z = this.z;
    var e = m.elements;

    var w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);

    this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
    this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
    this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;

    return this;
  }

  applyQuat(q: { x: any; y: any; z: any; w: any; }) {
    var x = this.x,
      y = this.y,
      z = this.z;
    var qx = q.x,
      qy = q.y,
      qz = q.z,
      qw = q.w;

    // calculate Quat * Vec

    var ix = qw * x + qy * z - qz * y;
    var iy = qw * y + qz * x - qx * z;
    var iz = qw * z + qx * y - qy * x;
    var iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse Quat

    this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;

    return this;
  }

  project(camera: { matrixWorldInverse: any; projectionMatrix: any; }) {
    return this.applyMat4(camera.matrixWorldInverse).applyMat4(
      camera.projectionMatrix
    );
  }

  unproject(camera: { projectionMatrixInverse: any; matrixWorld: any; }) {
    return this.applyMat4(camera.projectionMatrixInverse).applyMat4(
      camera.matrixWorld
    );
  }

  transformDirection(m: { elements: any; }) {
    // input: Mat4 affine matrix
    // Vec interpreted as a direction

    var x = this.x,
      y = this.y,
      z = this.z;
    var e = m.elements;

    this.x = e[0] * x + e[4] * y + e[8] * z;
    this.y = e[1] * x + e[5] * y + e[9] * z;
    this.z = e[2] * x + e[6] * y + e[10] * z;

    return this.normalize();
  }

  divide(v: Vec3) {
    this.x /= v.x;
    this.y /= v.y;
    this.z /= v.z;

    return this;
  }

  divideScalar(scalar: number) {
    return this.multiplyScalar(1 / scalar);
  }

  min(v: Vec3) {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    this.z = Math.min(this.z, v.z);

    return this;
  }

  max(v: Vec3) {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    this.z = Math.max(this.z, v.z);

    return this;
  }

  clamp(min: Vec3, max: Vec3) {
    // assumes min < max, componentwise

    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));
    this.z = Math.max(min.z, Math.min(max.z, this.z));

    return this;
  }

  clampScalar(minVal: number, maxVal: number) {
    this.x = Math.max(minVal, Math.min(maxVal, this.x));
    this.y = Math.max(minVal, Math.min(maxVal, this.y));
    this.z = Math.max(minVal, Math.min(maxVal, this.z));

    return this;
  }

  clampLength(min: number, max: number) {
    var length = this.length();

    return this.divideScalar(length || 1).multiplyScalar(
      Math.max(min, Math.min(max, length))
    );
  }

  floor() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    this.z = Math.floor(this.z);

    return this;
  }

  ceil() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    this.z = Math.ceil(this.z);

    return this;
  }

  round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    this.z = Math.round(this.z);

    return this;
  }

  roundToZero() {
    this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x);
    this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y);
    this.z = this.z < 0 ? Math.ceil(this.z) : Math.floor(this.z);

    return this;
  }

  negate() {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;

    return this;
  }

  dot(v: Vec3) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  // TODO lengthSquared?

  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
  }

  normalize(robust = false) {
    return this.divideScalar(this.length() || 1);

    // if (robust)
    // {
    //   var maxAbsComp = Math.abs(v[0]);
    //   for (var i = 1; i < N; ++i)
    //   {
    //     var absComp = Math.abs(v[i]);
    //     if (absComp > maxAbsComp)
    //     {
    //       maxAbsComp = absComp;
    //     }
    //   }

    //   var length;
    //   if (maxAbsComp > 0)
    //   {
    //     v /= maxAbsComp;
    //     length = Math.sqrt(Dot(v, v));
    //     v /= length;
    //     length *= maxAbsComp;
    //   }
    //   else
    //   {
    //     length = 0;
    //     for (var i = 0; i < N; ++i)
    //     {
    //       v[i] = 0;
    //     }
    //   }
    //   return length;
    // }
    // else
    // {
    //   var length = this.length();
    //   if (length > 0)
    //   {
    //     v /= length;
    //   }
    //   else
    //   {
    //     for (var i = 0; i < N; ++i)
    //     {
    //       v[i] = 0;
    //     }
    //   }
    // }
  }

  setLength(length: any) {
    return this.normalize().multiplyScalar(length);
  }

  lerp(v: Vec3, alpha: number) {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    this.z += (v.z - this.z) * alpha;

    return this;
  }

  lerpVecs(v1: Vec3, v2: any, alpha: any) {
    return this.subVecs(v2, v1)
      .multiplyScalar(alpha)
      .add(v1);
  }

  cross(v: Vec3, w?: Vec3) {
    if (w !== undefined) {
      console.warn(
        "Vec3: .cross() now only accepts one argument. Use .crossVecs( a, b ) instead."
      );
      return this.crossVecs(v, w);
    }

    return this.crossVecs(this, v);
  }

  crossVecs(a: Vec3, b: Vec3) {
    var ax = a.x,
      ay = a.y,
      az = a.z;
    var bx = b.x,
      by = b.y,
      bz = b.z;

    this.x = ay * bz - az * by;
    this.y = az * bx - ax * bz;
    this.z = ax * by - ay * bx;

    return this;
  }

  projectOnVec(vec: Vec3) {
    var scalar = vec.dot(this) / vec.lengthSq();

    return this.copy(vec).multiplyScalar(scalar);
  }

  projectOnPlane(planeNormal: any) {
    _vec.copy(this).projectOnVec(planeNormal);

    return this.sub(_vec);
  }

  reflect(normal: any) {
    // reflect incident Vec off plane orthogonal to normal
    // normal is assumed to have unit length

    return this.sub(_vec.copy(normal).multiplyScalar(2 * this.dot(normal)));
  }

  angleTo(v: Vec3, normal: Vec3 | any) {
    if (normal)
      return this.angleToEx(v, normal)

    var theta = this.dot(v) / Math.sqrt(this.lengthSq() * v.lengthSq());
    return Math.acos(clamp(theta, -1, 1));
  }

  angleToEx(v: Vec3, normal: Vec3) {
    var theta = this.dot(v) / Math.sqrt(this.lengthSq() * v.lengthSq());

    if (this.clone().cross(v).dot(normal) > 0)
      return Math.acos(clamp(theta, -1, 1));
    else
      return Math.PI * 2 - Math.acos(clamp(theta, -1, 1));
  }

  distanceTo(v: any) {
    return Math.sqrt(this.distanceToSquared(v));
  }

  distanceToSquared(v: Vec3) {
    var dx = this.x - v.x,
      dy = this.y - v.y,
      dz = this.z - v.z;

    return dx * dx + dy * dy + dz * dz;
  }

  manhattanDistanceTo(v: Vec3) {
    return (
      Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z)
    );
  }

  setFromSpherical(s: { radius: any; phi: any; theta: any; }) {
    return this.setFromSphericalCoords(s.radius, s.phi, s.theta);
  }

  setFromSphericalCoords(radius: number, phi: number, theta: number) {
    var sinPhiRadius = Math.sin(phi) * radius;

    this.x = sinPhiRadius * Math.sin(theta);
    this.y = Math.cos(phi) * radius;
    this.z = sinPhiRadius * Math.cos(theta);

    return this;
  }

  setFromCylindrical(c: { radius: any; theta: any; y: any; }) {
    return this.setFromCylindricalCoords(c.radius, c.theta, c.y);
  }

  setFromCylindricalCoords(radius: number, theta: number, y: number) {
    this.x = radius * Math.sin(theta);
    this.y = y;
    this.z = radius * Math.cos(theta);

    return this;
  }

  setFromMatrixPosition(m: { elements: any; }) {
    var e = m.elements;

    this.x = e[12];
    this.y = e[13];
    this.z = e[14];

    return this;
  }

  setFromMatrixScale(m: any) {
    var sx = this.setFromMatrixColumn(m, 0).length();
    var sy = this.setFromMatrixColumn(m, 1).length();
    var sz = this.setFromMatrixColumn(m, 2).length();

    this.x = sx;
    this.y = sy;
    this.z = sz;

    return this;
  }

  setFromMatrixColumn(m: { elements: any; }, index: number) {
    return this.fromArray(m.elements, index * 4);
  }

  equals(v: Vec3) {
    return v.x === this.x && v.y === this.y && v.z === this.z;
  }

  fromArray(array: { [x: string]: number; }, offset: number | undefined) {
    if (offset === undefined) offset = 0;

    this.x = array[offset];
    this.y = array[offset + 1];
    this.z = array[offset + 2];

    return this;
  }

  toArray(array: number[] = [], offset: number = 0) {

    array[offset] = this.x;
    array[offset + 1] = this.y;
    array[offset + 2] = this.z;

    return array;
  }

  fromBufferAttribute(attribute: { getX: (arg0: any) => number; getY: (arg0: any) => number; getZ: (arg0: any) => number; }, index: any, offset: undefined) {
    if (offset !== undefined) {
      console.warn(
        "Vec3: offset has been removed from .fromBufferAttribute()."
      );
    }

    this.x = attribute.getX(index);
    this.y = attribute.getY(index);
    this.z = attribute.getZ(index);

    return this;
  }

  toFixed(fractionDigits: number | undefined) {
    if (fractionDigits !== undefined) {
      this.x = parseFloat(this.x.toFixed(fractionDigits))
      this.y = parseFloat(this.y.toFixed(fractionDigits))
      this.z = parseFloat(this.z.toFixed(fractionDigits))
    }
    return this;
  }

  //---Distance-------------------------------------------------------------------------------
  distancePoint(point: Vec3): ResultDistance {
    const result: ResultDistance = {};
    result.distanceSqr = this.distanceToSquared(point);
    result.distance = Math.sqrt(result.distanceSqr);
    return result;
  }

  distanceLine(line: Line): ResultDistance {
    const result: ResultDistance = { parameters: [], closests: [] };
    var diff = this.clone().sub(line.origin);
    var lineParameter = line.direction.dot(diff);
    var lineClosest = line.direction
      .clone()
      .multiplyScalar(lineParameter)
      .add(line.origin);

    result.parameters!.push(0, lineParameter);
    result.closests!.push(this, lineClosest);

    diff = result.closests![0].clone().sub(result.closests![1]);
    result.distanceSqr = diff.dot(diff);
    result.distance = Math.sqrt(result.distanceSqr);
    return result;
  }

  /**
 * Test success
 * 到射线的距离
 * @param  {Line} line
 * @returns {Object} lineParameter 最近点的参数  lineClosest 最近点  distanceSqr 到最近点距离的平方  distance 到最近点距离
 */
  distanceRay(ray: Ray) {
    var result: ResultDistance = {
      parameters: [],
      closests: []
    };

    var diff = this.clone().sub(ray.origin);
    result.parameters![1] = ray.direction.dot(diff);

    if (result.parameters![1] > 0) {
      result.closests![1] = ray.direction
        .clone()
        .multiplyScalar(result.parameters![1])
        .add(ray.origin);
    } else {
      result.closests![1] = ray.origin.clone();
    }
    diff = this.clone().sub(result.closests![1]);
    result.distanceSqr = diff.dot(diff);
    result.distance = Math.sqrt(result.distanceSqr);

    return result;
  }

  /**
  * Test success
  * 到线段的距离
  * @param  {Line} line
  * @returns {Object} lineParameter 最近点的参数  lineClosest 最近点  distanceSqr 到最近点距离的平方  distance 到最近点距离
  */
  distanceSegment(segment: Segment) {
    const result: ResultDistance = {
      parameters: [],
      closests: []
    };

    var diff = this.clone().sub(segment.p1);
    var t = segment.extentDirection.dot(diff);

    if (t >= 0) {
      result.parameters![1] = 1;
      result.closests![1] = segment.p1;
    } else {
      diff = this.clone().sub(segment.p0);
      t = segment.extentDirection.dot(diff);
      if (t <= 0) {
        result.parameters![1] = 0;
        result.closests![1] = segment.p0;
      }
      else {
        var sqrLength = segment.extentSqr;
        if (sqrLength <= 0)
          sqrLength = 0;

        t /= sqrLength;
        result.parameters![1] = t;
        result.closests![1] = segment.extentDirection
          .clone()
          .multiplyScalar(t)
          .add(segment.p0);
      }
    }

    diff = this.clone().sub(result.closests![1]);
    result.distanceSqr = diff.dot(diff);
    result.distance = Math.sqrt(result.distanceSqr);

    return result;
  }

  /**
   * 点与线段的距离
   * @param plane 
   */
  distancePlane(plane: Plane) {
    // this.clone().sub(plane.origin).dot(plane.normal);
    const result: ResultDistance = {
      parameters: [],
      closests: [],
      signedDistance: 0,
      distance: 0
    };
    result.signedDistance = this.clone().dot(plane.normal) - plane.w;
    result.distance = Math.abs(result.signedDistance);
    result.closests![1] = this.clone().sub(plane.normal.clone().multiplyScalar(result.signedDistance));
    return result;
  }

  /**
   * 点与线段的距离
   * 点与折线的距离 测试排除法，平均比线性检索(暴力法)要快两倍以上
   */
  distancePolyLine(polyline: Polyline | Vec3[]) {
    let u = +Infinity;
    let ipos: number = -1;
    let tempResult: ResultDistance;
    let result = null;

    for (let i = 0; i < polyline.length - 1; i++) {
      const pti = polyline[i];
      const ptj = polyline[i + 1];
      if (Math.abs(pti.x - this.x) > u && Math.abs(ptj.x - this.x) > u && (pti.x - this.x) * (ptj.x - this.x) > 0)
        continue;
      if (Math.abs(pti.y - this.y) > u && Math.abs(ptj.y - this.y) > u && (pti.y - this.y) * (ptj.y - this.y) > 0)
        continue;
      if (Math.abs(pti.z - this.z) > u && Math.abs(ptj.z - this.z) > u && (pti.z - this.z) * (ptj.z - this.z) > 0)
        continue;
      tempResult = this.distanceSegment(new Segment(pti, ptj));
      if (tempResult.distance! < u) {
        u = tempResult.distance!;
        result = tempResult;
        ipos = i;
      }
    }

    result!.segmentIndex = ipos;
    return result;
  }
}

const _vec = v3();
const _quat: Quat = quat();

export function v3(x?: number, y?: number, z?: number) {
  return new Vec3(x, y, z);
}

