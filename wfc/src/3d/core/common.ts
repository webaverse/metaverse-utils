import { Vector3, Quaternion, Matrix4 } from 'three';


const XYZSort = (e1: Vector3, e2: Vector3) => {
    if (e1.x !== e2.x)
        return e1.x - e2.x;
    else if (e1.y !== e2.y)
        return e1.y - e2.y;
    else
        return e1.z - e2.z;
}


const _vector = new Vector3();
export function clone(array: any | []) {
    var result = new Array()
    for (let i = 0; i < array.length; i++) {
        var ele = array[i];
        if (ele instanceof Number || ele instanceof String)
            result[i] = ele;
        else if (ele.clone) {
            result[i] = ele.clone();
        }
        else if (ele instanceof Array)
            result[i] = clone(ele);
        else
            throw ("数组有元素不能clone")
    }
    return result;
}


/**
 * 点排序函数
 * @param {Vector*} a 
 * @param {Vector*} b
 */
export function vectorCompare(a: any | Vector3, b: any | Vector3) {
    if (a.x === b.x) {
        if (a.z !== undefined && a.y === b.y)
            return a.z - b.z
        else
            return a.y - b.y;
    }
    else
        return a.x - b.x;
}

/**
 * 将向量拆解为数字
 * @param {Array} points 
 * @param {String} feature 
 * @returns {Array<Number>} 数字数组
 */
export function verctorToNumbers(points: any, feature = "xyz"): any {
    if (!(points instanceof Array)) {
        console.error("传入参数必须是数组");
        return;
    }

    var numbers: any = [];
    if (points[0].x !== undefined && points[0].y !== undefined && points[0].z !== undefined) {
        for (var i = 0; i < points.length; i++) {
            for (let j = 0; j < feature.length; j++) {
                numbers.push(points[i][feature[j]]);
            }
        }
    } else if (points[0].x !== undefined && points[0].y !== undefined)
        for (var i = 0; i < points.length; i++) {
            numbers.push(points[i].x);
            numbers.push(points[i].y);
        }
    else if (points[0] instanceof Array) {
        for (var i = 0; i < points.length; i++) {
            numbers = numbers.concat(verctorToNumbers(points[i]));
        }
    } else {
        console.error("数组内部的元素不是向量");
    }

    return numbers;
}

/**
 * 计算包围盒
 * @param {*} points  点集
 * @returns {Array[min,max]} 返回最小最大值
 */
export function boundingBox(points: Vector3[]) {
    const min = new Vector3(+Infinity, +Infinity, +Infinity);
    const max = new Vector3(-Infinity, -Infinity, -Infinity);
    for (let i = 0; i < points.length; i++) {
        min.min(points[i]);
        max.max(points[i]);
    }
    return [min, max];
}

/**
 * 
 * @param {*} points 
 * @param {*} Quaternion 
 * @param {Boolean} ref 是否是引用
 */
export function applyQuat(points: any | Vector3[], Quaternion: Quaternion, ref = true): Vector3 | any {
    if (ref) {
        points.flat(Infinity).forEach((point: Vector3 | any) => {
            point.applyQuat(Quaternion);
        });
        return points;
    }

    return applyQuat(clone(points), Quaternion)
}

/**
 * 平移
 * @param {*} points 
 * @param {*} distance 
 * @param {*} ref 
 */
export function translate(points: any | Vector3[], distance: Vector3, ref = true): Vector3[] | any {
    if (ref) {
        points.flat(Infinity).forEach((point: Vector3 | any) => {
            point.add(distance);
        });
        return points;
    }
    return translate(clone(points), distance)
}

/**
 * 旋转
 * @param {*} points 
 * @param {*} axis 
 * @param {*} angle 
 * @param {*} ref 
 */
export function rotate(points: any | Vector3[], axis: Vector3, angle: number, ref = true) {
    return applyQuat(points, new Quaternion().setFromAxisAngle(axis, angle), ref)
}

/**
 * 两个向量之间存在的旋转量来旋转点集
 * @param {*} points 
 * @param {*} axis 
 * @param {*} angle 
 * @param {*} ref 
 */
export function rotateByUnitVectors(points: any | Vector3[], vFrom: Vector3, vTo: Vector3, ref = true) {
    return applyQuat(points, new Quaternion().setFromUnitVectors(vFrom, vTo), ref)
}


/**
 * 缩放
 * @param {*} points 
 * @param {*} axis 
 * @param {*} angle 
 * @param {*} ref 
 */
export function scale(points: any | Vector3[], _scale: Vector3, ref = true): Vector3[] | any {
    if (ref) {
        points.flat(Infinity).forEach((point: Vector3 | any) => {
            point.scale.multiply(_scale);
        });
        return points;
    }
    return scale(clone(points), _scale);
}

/**
 * 响应矩阵
 * @param {*} points 
 * @param {*} axis 
 * @param {*} angle 
 * @param {*} ref 
 */
export function applyMatrix4(points: any | Vector3[], matrix: Matrix4, ref = true): Vector3[] | any {
    if (ref) {
        points.flat(Infinity).forEach((point: Vector3 | any) => {
            point.applyMatrix4(matrix);
        });
        return points;
    }
    return applyMatrix4(clone(points), matrix);
}

/**
 * 简化点集数组，折线，路径
 * @param {*} points 点集数组，折线，路径 ,继承Array
 * @param {*} maxDistance  简化最大距离
 * @param {*} maxAngle  简化最大角度
 */
export function simplifyPointList(points: any | Vector3[], maxDistance = 0.1, maxAngle = Math.PI / 180 * 5) {
    for (let i = 0; i < points.length; i++) {
        // 删除小距离
        const P = points[i];
        const nextP = points[i + 1];
        if (P.distanceTo(nextP) < maxDistance) {
            if (i === 0)
                points.remove(i + 1, 1);
            else if (i === points.length - 2)
                points.splice(i, 1);
            else {
                points.splice(i, 2, P.clone().add(nextP).multiplyScalar(0.5));
            }
            i--;
        }
    }

    for (let i = 1; i < points.length - 1; i++) {
        // 删除小小角度
        const preP = points[i - 1];
        const P = points[i];
        const nextP = points[i + 1];
        if (Math.acos(P.clone().sub(preP).normalize().dot(nextP.clone().sub(P).normalize())) < maxAngle) {
            points.splice(i, 1);
            i--
        }
    }
    return points;
}


