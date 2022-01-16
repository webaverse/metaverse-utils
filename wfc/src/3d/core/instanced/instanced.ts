import { Matrix4, Vector3, Quaternion, Object3D, Group, Mesh, BufferGeometry, BufferAttribute } from 'three';
import { InstancedMesh } from './instancedmesh';


const _v1 = new Vector3();
const _m1 = new Matrix4();
var _zero = new Vector3(0, 0, 0);
var _one = new Vector3(1, 1, 1);
var _qzero = new Quaternion();

export function decompose(matrix: Matrix4, position?: Vector3, quaternion?: Quaternion, scale?: Vector3) {

    var te = matrix.elements;

    var sx = _v1.set(te[0], te[1], te[2]).length();
    var sy = _v1.set(te[4], te[5], te[6]).length();
    var sz = _v1.set(te[8], te[9], te[10]).length();

    // if determine is negative, we need to invert one scale
    var det = matrix.determinant();
    if (det < 0) sx = - sx;

    if (position) {
        position.x = te[12];
        position.y = te[13];
        position.z = te[14];
    }

    if (quaternion) {
        // scale the rotation part
        _m1.copy(matrix);

        var invSX = 1 / sx;
        var invSY = 1 / sy;
        var invSZ = 1 / sz;

        _m1.elements[0] *= invSX;
        _m1.elements[1] *= invSX;
        _m1.elements[2] *= invSX;

        _m1.elements[4] *= invSY;
        _m1.elements[5] *= invSY;
        _m1.elements[6] *= invSY;

        _m1.elements[8] *= invSZ;
        _m1.elements[9] *= invSZ;
        _m1.elements[10] *= invSZ;

        quaternion.setFromRotationMatrix(_m1);
    }

    if (scale) {
        scale.x = sx;
        scale.y = sy;
        scale.z = sz;
    }
}

export function compose(matrix: Matrix4, position: Vector3 = _zero, quaternion: Quaternion = _qzero, scale: Vector3 = _one) {

    var te = matrix.elements;

    var x = quaternion.x, y = quaternion.y, z = quaternion.z, w = quaternion.w;
    var x2 = x + x, y2 = y + y, z2 = z + z;
    var xx = x * x2, xy = x * y2, xz = x * z2;
    var yy = y * y2, yz = y * z2, zz = z * z2;
    var wx = w * x2, wy = w * y2, wz = w * z2;

    var sx = scale.x, sy = scale.y, sz = scale.z;

    te[0] = (1 - (yy + zz)) * sx;
    te[1] = (xy + wz) * sx;
    te[2] = (xz - wy) * sx;
    te[3] = 0;

    te[4] = (xy - wz) * sy;
    te[5] = (1 - (xx + zz)) * sy;
    te[6] = (yz + wx) * sy;
    te[7] = 0;

    te[8] = (xz + wy) * sz;
    te[9] = (yz - wx) * sz;
    te[10] = (1 - (xx + yy)) * sz;
    te[11] = 0;

    te[12] = position.x;
    te[13] = position.y;
    te[14] = position.z;
    te[15] = 1;
}


/**
 * 所有的对象中的所有Mesh都合并
 * @param objs 
 * @param toBufferGeometry 
 * @param hasMap 
 */
export function mergeAnys(objs: any[] | Object3D | Group | Mesh | any, toBufferGeometry: boolean = true, hasMap: boolean = true) {
    let finalGeometry,
        finalboundingBox: any = null,
        materials: any = [],
        mergedGeometry = new BufferGeometry(),
        mergedMesh,
        materialPointer = 0,
        reindex = 0;
    objs = Array.isArray(objs) ? objs : [objs];
    for (let i = 0; i < objs.length; i++) {
        var obj = objs[i] as Object3D;
        obj.updateMatrixWorld(true);
        obj.traverse((mesh: Mesh | any) => {
            if (!mesh.geometry)
                return;

            if (Array.isArray(mesh.material)) {
                for (var i = 0, len = mesh.material.length; i < len; i++) {
                    materials[materialPointer++] = mesh.material[i];
                }
            }
            else
                materials[materialPointer++] = mesh.material;

            var ogeometry: BufferGeometry | any = mesh.geometry;

            var geo = (mesh.geometry as any);

            if (geo.isBufferGeometry) {
                if (hasMap && geo.attributes['uv'] === undefined) {
                    var count = geo.attributes['position'].count * 2;
                    var uvs = new Float32Array(count);
                    for (var i = 0; i < length; i++) {
                        uvs[i] = 0;
                    }
                    geo.setAttribute('uv', new BufferAttribute(uvs, 2));
                }
                ogeometry = ogeometry;
            } else if (geo.isGeometry) {
                ogeometry = geo;
            }

            mergedGeometry.merge(ogeometry, reindex);

            reindex = materialPointer;
        });
    }

    // mergedGeometry.groupsNeedUpdate = true;


    finalGeometry = mergedGeometry;
    mergedGeometry.boundingBox = finalboundingBox;
    mergedMesh = new Mesh(finalGeometry, materials);
    //mergedMesh.geometry.computeFaceNormals();
    //mergedMesh.geometry.computeVertexNormals();

    return mergedMesh;
}


/**
 * 共用几何体的模型都是用Instanced，达到优化目的
 * @param obj 
 */
export function convertInstanced(obj: Object3D | Group | any): any {
    const result: Object3D = new Object3D();

    (obj as Object3D).updateMatrixWorld(true);
    const geoDic: any = {};

    obj.traverse((child: any) => {
        if (child.geometry) {
            if (!geoDic[child.geometry.uuid])
                geoDic[child.geometry.uuid] = [];
            geoDic[child.geometry.uuid].push(child);
        }
    });
    // debugger
    for (const key in geoDic) {
        if (geoDic.hasOwnProperty(key)) {
            const arys = geoDic[key];
            const instancedMesh = new InstancedMesh(arys[0].geometry, arys[0].material, arys.length);

            for (let i = 0; i < arys.length; i++) {
                instancedMesh.setMatrixAt(i, (arys[i] as Object3D).matrixWorld);
            }
            result.add(instancedMesh);
        }
    }
    return result;
}

