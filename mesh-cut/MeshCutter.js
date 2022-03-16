// import * as THREE from 'three';
import Delaunator from 'https://cdn.skypack.dev/delaunator@5.0.0';

class MeshCutter {
  constructor() {
    this.tempLine1 = new THREE.Line3();
    this.localPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    this.tempVector3 = new THREE.Vector3();
    this.tempVector2 = new THREE.Vector2();
    this.planeQuaternion = new THREE.Quaternion();
    this.planeQuaternionNegate = new THREE.Quaternion();
    this.zAxis = new THREE.Vector3(0, 0, 1);
    this.epsilon = 0.001;
  }

  getIntersectNode(v0, v1, n0, n1, u0, u1) {
    this.tempLine1.start.copy(v0);
    this.tempLine1.end.copy(v1);
    let vI = new THREE.Vector3();
    vI = this.localPlane.intersectLine(this.tempLine1, vI);

    const total = this.tempVector3.subVectors(v1, v0).lengthSq();
    const part = this.tempVector3.subVectors(vI, v0).lengthSq();
    const ratio = Math.sqrt(part / total);

    const normalPart = this.tempVector3.subVectors(n1, n0).multiplyScalar(ratio);
    const nI = new THREE.Vector3().copy(n0).add(normalPart);

    const uvPart = this.tempVector2.subVectors(u1, u0).multiplyScalar(ratio);
    const uI = new THREE.Vector2().copy(u0).add(uvPart);

    return {vI, nI, uI};
  }

  getVertexIndex(faceIdx, vert, indices) {
    // vert = 0, 1 or 2.
    const idx = faceIdx * 3 + vert;
    return indices ? indices[idx] : idx;
  }

  createGeometry(points, uvs, normals) {
    const geometry = new THREE.BufferGeometry();

    // buffers

    const aPoints = [];
    points.forEach(point => aPoints.push(point.x, point.y, point.z));
    const aNormals = [];
    normals.forEach(normal => aNormals.push(normal.x, normal.y, normal.z));
    const aUvs = [];
    uvs.forEach(uv => aUvs.push(uv.x, uv.y));

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(aPoints, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(aNormals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(aUvs, 2));

    return geometry;
  }

  markOuterHalfedges() {
    // todo: need recur filter out.
    
    let anyNotOverlap = false
    // todo: performance: filter halfedge === -1 first.
    for(let i = 0; i < this.delaunay.numTriangles; i++) {
      if(this.delaunay.outers[i * 3 + 0]) continue

      const halfedge0 = this.delaunay.halfedges[i * 3 + 0];
      const halfedge1 = this.delaunay.halfedges[i * 3 + 1];
      const halfedge2 = this.delaunay.halfedges[i * 3 + 2];

      const coordIndex0 = this.delaunay.triangles[i * 3 + 0];
      const coordIndex1 = this.delaunay.triangles[i * 3 + 1];
      const coordIndex2 = this.delaunay.triangles[i * 3 + 2];
      const x0 = this.delaunay.coords[coordIndex0 * 2]
      const y0 = this.delaunay.coords[coordIndex0 * 2 + 1]
      const x1 = this.delaunay.coords[coordIndex1 * 2]
      const y1 = this.delaunay.coords[coordIndex1 * 2 + 1]
      const x2 = this.delaunay.coords[coordIndex2 * 2]
      const y2 = this.delaunay.coords[coordIndex2 * 2 + 1]
      
      let anyNotOverlap2 = false
      if(halfedge0 === -1) {
        let isOverlap0 = false
        for(let il = 0; il < this.linesInner.length; il += 2) {
          const p0 = this.linesInner[il]
          const p1 = this.linesInner[il + 1]
          if( // todo: why lost precision?
            // (x0 === p0.x && y0 === p0.y && x1 === p1.x && y1 === p1.y) ||
            // (x0 === p1.x && y0 === p1.y && x1 === p0.x && y1 === p0.y)
            (Math.abs(x0 - p0.x) < this.epsilon && Math.abs(y0 - p0.y) < this.epsilon && Math.abs(x1 - p1.x) < this.epsilon && Math.abs(y1 - p1.y) < this.epsilon) ||
            (Math.abs(x0 - p1.x) < this.epsilon && Math.abs(y0 - p1.y) < this.epsilon && Math.abs(x1 - p0.x) < this.epsilon && Math.abs(y1 - p0.y) < this.epsilon)
          ) {
            isOverlap0 = true;
            break;
          }
        }
        if(!isOverlap0) {
          anyNotOverlap2 = true
          // continue
        };
      }

      if(halfedge1 === -1) {
        let isOverlap1 = false
        for(let il = 0; il < this.linesInner.length; il += 2) {
          const p0 = this.linesInner[il]
          const p1 = this.linesInner[il + 1]
          if(
            // (x1 === p0.x && y1 === p0.y && x2 === p1.x && y2 === p1.y) ||
            // (x1 === p1.x && y1 === p1.y && x2 === p0.x && y2 === p0.y)
            (Math.abs(x1 - p0.x) < this.epsilon && Math.abs(y1 - p0.y) < this.epsilon && Math.abs(x2 - p1.x) < this.epsilon && Math.abs(y2 - p1.y) < this.epsilon) ||
            (Math.abs(x1 - p1.x) < this.epsilon && Math.abs(y1 - p1.y) < this.epsilon && Math.abs(x2 - p0.x) < this.epsilon && Math.abs(y2 - p0.y) < this.epsilon)
          ) {
            isOverlap1 = true;
            break;
          }
        }
        if(!isOverlap1) {
          anyNotOverlap2 = true
          // continue
        };
      }

      if(halfedge2 === -1) {
        let isOverlap2 = false
        for(let il = 0; il < this.linesInner.length; il += 2) {
          const p0 = this.linesInner[il]
          const p1 = this.linesInner[il + 1]
          if(
            // (x2 === p0.x && y2 === p0.y && x0 === p1.x && y0 === p1.y) ||
            // (x2 === p1.x && y2 === p1.y && x0 === p0.x && y0 === p0.y)
            (Math.abs(x2 - p0.x) < this.epsilon && Math.abs(y2 - p0.y) < this.epsilon && Math.abs(x0 - p1.x) < this.epsilon && Math.abs(y0 - p1.y) < this.epsilon) ||
            (Math.abs(x2 - p1.x) < this.epsilon && Math.abs(y2 - p1.y) < this.epsilon && Math.abs(x0 - p0.x) < this.epsilon && Math.abs(y0 - p0.y) < this.epsilon)
          ) {
            isOverlap2 = true;
            break;
          }
        }
        if(!isOverlap2) {
          anyNotOverlap2 = true
          // continue
        };
      }

      if(anyNotOverlap2) {
        this.delaunay.halfedges[this.delaunay.halfedges[i * 3 + 0]] = -1
        this.delaunay.halfedges[this.delaunay.halfedges[i * 3 + 1]] = -1
        this.delaunay.halfedges[this.delaunay.halfedges[i * 3 + 2]] = -1
        anyNotOverlap = true
        this.delaunay.outers[i * 3 + 0] = true
        this.delaunay.outers[i * 3 + 1] = true
        this.delaunay.outers[i * 3 + 2] = true
      }

      // this.delaunayTemp.triangles.push(
      //   coordIndex0,
      //   coordIndex1,
      //   coordIndex2,
      // )
      // this.delaunayTemp.halfedges.push(
      //   halfedge0,
      //   halfedge1,
      //   halfedge2,
      // )
    }

    return anyNotOverlap
  }

  delOuterTriangles() {
    // todo: need recur filter out.

    // this.delaunay2 = {
    //   coords: this.delaunay.coords.slice(),
    //   halfedges: this.delaunay.halfedges.slice(),
    //   hull: this.delaunay.hull.slice(),
    //   triangles: this.delaunay.triangles.slice(),
    //   trianglesLen: this.delaunay.trianglesLen,
    // }
    this.delaunayTemp = {
      coords: this.delaunay.coords, // note: don't need filter out, so don't need clone.
      halfedges: [],
      hull: [],
      triangles: [],
      trianglesLen: 0,
    }
    
    // todo: performance: filter halfedge === -1 first.
    for(let i = 0; i < this.delaunay.numTriangles; i++) {
      const halfedge0 = this.delaunay.halfedges[i * 3 + 0];
      const halfedge1 = this.delaunay.halfedges[i * 3 + 1];
      const halfedge2 = this.delaunay.halfedges[i * 3 + 2];

      const coordIndex0 = this.delaunay.triangles[i * 3 + 0];
      const coordIndex1 = this.delaunay.triangles[i * 3 + 1];
      const coordIndex2 = this.delaunay.triangles[i * 3 + 2];
      const x0 = this.delaunay.coords[coordIndex0 * 2]
      const y0 = this.delaunay.coords[coordIndex0 * 2 + 1]
      const x1 = this.delaunay.coords[coordIndex1 * 2]
      const y1 = this.delaunay.coords[coordIndex1 * 2 + 1]
      const x2 = this.delaunay.coords[coordIndex2 * 2]
      const y2 = this.delaunay.coords[coordIndex2 * 2 + 1]
      
      if(halfedge0 === -1) {
        let isOverlap0 = false
        for(let il = 0; il < this.linesInner.length; il += 2) {
          const p0 = this.linesInner[il]
          const p1 = this.linesInner[il + 1]
          if( // todo: why lost precision?
            // (x0 === p0.x && y0 === p0.y && x1 === p1.x && y1 === p1.y) ||
            // (x0 === p1.x && y0 === p1.y && x1 === p0.x && y1 === p0.y)
            (Math.abs(x0 - p0.x) < this.epsilon && Math.abs(y0 - p0.y) < this.epsilon && Math.abs(x1 - p1.x) < this.epsilon && Math.abs(y1 - p1.y) < this.epsilon) ||
            (Math.abs(x0 - p1.x) < this.epsilon && Math.abs(y0 - p1.y) < this.epsilon && Math.abs(x1 - p0.x) < this.epsilon && Math.abs(y1 - p0.y) < this.epsilon)
          ) {
            isOverlap0 = true;
            break;
          }
        }
        if(!isOverlap0) continue
      }

      if(halfedge1 === -1) {
        let isOverlap1 = false
        for(let il = 0; il < this.linesInner.length; il += 2) {
          const p0 = this.linesInner[il]
          const p1 = this.linesInner[il + 1]
          if(
            // (x1 === p0.x && y1 === p0.y && x2 === p1.x && y2 === p1.y) ||
            // (x1 === p1.x && y1 === p1.y && x2 === p0.x && y2 === p0.y)
            (Math.abs(x1 - p0.x) < this.epsilon && Math.abs(y1 - p0.y) < this.epsilon && Math.abs(x2 - p1.x) < this.epsilon && Math.abs(y2 - p1.y) < this.epsilon) ||
            (Math.abs(x1 - p1.x) < this.epsilon && Math.abs(y1 - p1.y) < this.epsilon && Math.abs(x2 - p0.x) < this.epsilon && Math.abs(y2 - p0.y) < this.epsilon)
          ) {
            isOverlap1 = true;
            break;
          }
        }
        if(!isOverlap1) continue
      }

      if(halfedge2 === -1) {
        let isOverlap2 = false
        for(let il = 0; il < this.linesInner.length; il += 2) {
          const p0 = this.linesInner[il]
          const p1 = this.linesInner[il + 1]
          if(
            // (x2 === p0.x && y2 === p0.y && x0 === p1.x && y0 === p1.y) ||
            // (x2 === p1.x && y2 === p1.y && x0 === p0.x && y0 === p0.y)
            (Math.abs(x2 - p0.x) < this.epsilon && Math.abs(y2 - p0.y) < this.epsilon && Math.abs(x0 - p1.x) < this.epsilon && Math.abs(y0 - p1.y) < this.epsilon) ||
            (Math.abs(x2 - p1.x) < this.epsilon && Math.abs(y2 - p1.y) < this.epsilon && Math.abs(x0 - p0.x) < this.epsilon && Math.abs(y0 - p0.y) < this.epsilon)
          ) {
            isOverlap2 = true;
            break;
          }
        }
        if(!isOverlap2) continue
      }

      this.delaunayTemp.triangles.push(
        coordIndex0,
        coordIndex1,
        coordIndex2,
      )
      this.delaunayTemp.halfedges.push(
        halfedge0,
        halfedge1,
        halfedge2,
      )
    }

    this.delaunayTemp.trianglesLen = this.delaunayTemp.triangles.length;
    this.delaunayTemp.numTriangles = this.delaunayTemp.trianglesLen / 3;

    this.delaunay = this.delaunayTemp
  }

  createInnerFaces() {
    // // test
    // this.points1.push(
    //   new THREE.Vector3(0, 0, 0),
    //   new THREE.Vector3(0, 1, -1),
    //   new THREE.Vector3(0, 1, 1),
    // )

    // test
    // this.points1.length = 0
    // this.normals1.length = 0
    // this.uvs1.length = 0

    // // test
    // this.points1.forEach((point, i) => {
    //   this.points1[i] = point.clone()
    //   // this.points1[i].z -= 1 // test
    // })

    console.log({pointsInner:this.pointsInner})
    this.innerCoords2D = [];
    this.pointsInner.forEach(point => {
      this.innerCoords2D.push(point.x, point.y)
    })
    this.delaunay = new Delaunator(this.innerCoords2D);
    console.log(this.delaunay);
    this.delaunay.numTriangles = this.delaunay.trianglesLen / 3;
    console.log({numTriangles: this.delaunay.numTriangles})
    console.log({linesInner: this.linesInner})

    this.delaunay.outers = []
    for(let i = 0; i < this.delaunay.trianglesLen; i++) {
      this.delaunay.outers.push(false)
    }
    while(this.markOuterHalfedges()) {
      console.log('recur')
      // debugger
    }
    // this.markOuterHalfedges();
    // this.markOuterHalfedges();

    this.delOuterTriangles()
    
    for(let i = 0; i < this.delaunay.numTriangles; i++) {
      const x0 = this.delaunay.coords[this.delaunay.triangles[i * 3 + 0] * 2]
      const y0 = this.delaunay.coords[this.delaunay.triangles[i * 3 + 0] * 2 + 1]
      const x1 = this.delaunay.coords[this.delaunay.triangles[i * 3 + 1] * 2]
      const y1 = this.delaunay.coords[this.delaunay.triangles[i * 3 + 1] * 2 + 1]
      const x2 = this.delaunay.coords[this.delaunay.triangles[i * 3 + 2] * 2]
      const y2 = this.delaunay.coords[this.delaunay.triangles[i * 3 + 2] * 2 + 1]

      console.log('remained triangle')

      this.points1.push(
        new THREE.Vector3(x0, y0, 0),
        new THREE.Vector3(x2, y2, 0),
        new THREE.Vector3(x1, y1, 0),
      )
      this.points2.push(
        new THREE.Vector3(x0, y0, 0),
        new THREE.Vector3(x1, y1, 0),
        new THREE.Vector3(x2, y2, 0),
      )
      
      const uv0 = this.uvsInner[this.delaunay.triangles[i * 3 + 0]]
      const uv1 = this.uvsInner[this.delaunay.triangles[i * 3 + 1]]
      const uv2 = this.uvsInner[this.delaunay.triangles[i * 3 + 2]]
      this.uvs1.push(
        uv0,
        uv2,
        uv1,
      )
      this.uvs2.push(
        uv0,
        uv1,
        uv2,
      )
      // this.uvs1.push(
      //   0,
      //   0,
      //   0,
      // )
      
      // const normal0 = this.normalsInner[this.delaunay.triangles[i * 3 + 0]]
      // const normal1 = this.normalsInner[this.delaunay.triangles[i * 3 + 1]]
      // const normal2 = this.normalsInner[this.delaunay.triangles[i * 3 + 2]]
      // this.normals1.push(
      //   normal0,
      //   normal2,
      //   normal1,
      // )
      this.normals1.push(
        0,
        0,
        0,
      )
      this.normals2.push(
        0,
        0,
        0,
      )
    }
  }

  cutByPlane(object, plane, isInnerFaces = false) { // todo: add arg: isDelOuterTriangles = false, convex geometries don't need delete outer triangles.
    // Returns breakable objects in output.object1 and output.object2 members, the resulting 2 pieces of the cut.
    // object2 can be null if the plane doesn't cut the object.
    // object1 can be null only in case of internal error
    // Returned value is number of pieces, 0 for error.

    this.planeQuaternion.setFromUnitVectors(this.zAxis, plane.normal);
    this.planeQuaternionNegate.setFromUnitVectors(plane.normal, this.zAxis);

    this.isInnerFaces = isInnerFaces;

    const geometry = object.geometry;
    const coords = geometry.attributes.position.array;
    const normals = geometry.attributes.normal.array;
    const uvs = geometry.attributes.uv.array;

    const numPoints = coords.length / 3;
    let numFaces = numPoints / 3;

    let indices = geometry.getIndex();

    if (indices) {
      indices = indices.array;
      numFaces = indices.length / 3;
    }

    this.linesInner = [];

    this.points1 = [];
    this.points2 = [];
    this.pointsInner = [];

    this.normals1 = [];
    this.normals2 = [];
    // this.normalsInner = []; // should don't need, just re-calc is ok.

    this.uvs1 = [];
    this.uvs2 = [];
    this.uvsInner = []; // should don't need, just re-calc is ok.

    // Transform the plane to object local space
    // object.updateMatrix();
    // this.transformPlaneToLocalSpace(plane, object.matrix, this.localPlane);
    // todo: still use "Transform the plane to object local space"

    // Transform the object.geometry to plane space
    object.geometry.applyQuaternion(this.planeQuaternionNegate)

    // Iterate through the faces adding points to both pieces
    for (let i = 0; i < numFaces; i++) {
      const va = this.getVertexIndex(i, 0, indices);
      const vb = this.getVertexIndex(i, 1, indices);
      const vc = this.getVertexIndex(i, 2, indices);

      const v0 = new THREE.Vector3(coords[3 * va], coords[3 * va + 1], coords[3 * va + 2]);
      const v1 = new THREE.Vector3(coords[3 * vb], coords[3 * vb + 1], coords[3 * vb + 2]);
      const v2 = new THREE.Vector3(coords[3 * vc], coords[3 * vc + 1], coords[3 * vc + 2]);

      const n0 = new THREE.Vector3(normals[3 * va], normals[3 * va + 1], normals[3 * va + 2]);
      const n1 = new THREE.Vector3(normals[3 * vb], normals[3 * vb + 1], normals[3 * vb + 2]);
      const n2 = new THREE.Vector3(normals[3 * vc], normals[3 * vc + 1], normals[3 * vc + 2]);

      const u0 = new THREE.Vector2(uvs[2 * va], uvs[2 * va + 1]);
      const u1 = new THREE.Vector2(uvs[2 * vb], uvs[2 * vb + 1]);
      const u2 = new THREE.Vector2(uvs[2 * vc], uvs[2 * vc + 1]);

      const d0 = this.localPlane.distanceToPoint(v0);
      const d1 = this.localPlane.distanceToPoint(v1);
      const d2 = this.localPlane.distanceToPoint(v2);

      const sign0 = Math.sign(d0);
      const sign1 = Math.sign(d1);
      const sign2 = Math.sign(d2);

      if (sign0 === sign1 && sign1 === sign2 && sign2 === sign0) {
        if (sign0 === -1) {
          this.points1.push(v0, v1, v2);
          this.normals1.push(n0, n1, n2);
          this.uvs1.push(u0, u1, u2);
        } else if (sign0 === 1) {
          this.points2.push(v0, v1, v2);
          this.normals2.push(n0, n1, n2);
          this.uvs2.push(u0, u1, u2);
        } else if (sign0 === 0) {
          this.points2.push(v0, v1, v2);
          this.normals2.push(n0, n1, n2);
          this.uvs2.push(u0, u1, u2);
          this.linesInner.push(v0, v1);
          this.linesInner.push(v1, v2);
          this.linesInner.push(v2, v0);
          this.pointsInner.push(v0, v1, v2);
          // this.normalsInner.push(n0, n1, n2);
          this.uvsInner.push(u0, u1, u2);
        }
      } else if (sign0 === sign1) {
        if (sign0 === -1) {
          if (sign2 === 1) {
            const {vI: vI0, nI: nI0, uI: uI0} = this.getIntersectNode(v0, v2, n0, n1, u0, u2);
            const {vI: vI1, nI: nI1, uI: uI1} = this.getIntersectNode(v1, v2, n1, n2, u1, u2);
            this.points1.push(v0, vI1, vI0);
            this.normals1.push(n0, nI1, nI0);
            this.uvs1.push(u0, uI1, uI0);
            this.points1.push(v0, v1, vI1);
            this.normals1.push(n0, n1, nI1);
            this.uvs1.push(u0, u1, uI1);
            this.points2.push(v2, vI0, vI1);
            this.normals2.push(n2, nI0, nI1);
            this.uvs2.push(u2, uI0, uI1);
            this.linesInner.push(vI0, vI1);
            this.pointsInner.push(vI0, vI1);
            // this.normalsInner.push(nI0, nI1);
            this.uvsInner.push(uI0, uI1);
          } else if (sign2 === 0) {
            this.points1.push(v0, v1, v2);
            this.normals1.push(n0, n1, n2);
            this.uvs1.push(u0, u1, u2);
            this.pointsInner.push(v2);
            // this.normalsInner.push(n2);
            this.uvsInner.push(u2);
          }
        } else if (sign0 === 1) {
          if (sign2 === -1) {
            const {vI: vI0, nI: nI0, uI: uI0} = this.getIntersectNode(v0, v2, n0, n2, u0, u2);
            const {vI: vI1, nI: nI1, uI: uI1} = this.getIntersectNode(v1, v2, n1, n2, u1, u2);
            this.points2.push(v0, vI1, vI0);
            this.normals2.push(n0, nI1, nI0);
            this.uvs2.push(u0, uI1, uI0);
            this.points2.push(v0, v1, vI1);
            this.normals2.push(n0, n1, nI1);
            this.uvs2.push(u0, u1, uI1);
            this.points1.push(v2, vI0, vI1);
            this.normals1.push(n2, nI0, nI1);
            this.uvs1.push(u2, uI0, uI1);
            this.linesInner.push(vI0, vI1);
            this.pointsInner.push(vI0, vI1);
            // this.normalsInner.push(nI0, nI1);
            this.uvsInner.push(uI0, uI1);
          } else if (sign2 === 0) {
            this.points2.push(v0, v1, v2);
            this.normals2.push(n0, n1, n2);
            this.uvs2.push(u0, u1, u2);
            this.pointsInner.push(v2);
            // this.normalsInner.push(n2);
            this.uvsInner.push(u2);
          }
        } else if (sign0 === 0) {
          if (sign2 === -1) {
            this.points1.push(v0, v1, v2);
            this.normals1.push(n0, n1, n2);
            this.uvs1.push(u0, u1, u2);
            this.linesInner.push(v0, v1);
            this.pointsInner.push(v0, v1);
            // this.normalsInner.push(n0, n1);
            this.uvsInner.push(u0, u1);
          } else if (sign2 === 1) {
            this.points2.push(v0, v1, v2);
            this.normals2.push(n0, n1, n2);
            this.uvs2.push(u0, u1, u2);
            this.linesInner.push(v0, v1);
            this.pointsInner.push(v0, v1);
            // this.normalsInner.push(n0, n1);
            this.uvsInner.push(u0, u1);
          }
        }
      } else if (sign1 === sign2) {
        if (sign1 === -1) {
          if (sign0 === 1) {
            const {vI: vI0, nI: nI0, uI: uI0} = this.getIntersectNode(v1, v0, n1, n0, u1, u0);
            const {vI: vI1, nI: nI1, uI: uI1} = this.getIntersectNode(v2, v0, n2, n0, u2, u0);
            this.points1.push(v1, vI1, vI0);
            this.normals1.push(n1, nI1, nI0);
            this.uvs1.push(u1, uI1, uI0);
            this.points1.push(v1, v2, vI1);
            this.normals1.push(n1, n2, nI1);
            this.uvs1.push(u1, u2, uI1);
            this.points2.push(v0, vI0, vI1);
            this.normals2.push(n0, nI0, nI1);
            this.uvs2.push(u0, uI0, uI1);
            this.linesInner.push(vI0, vI1);
            this.pointsInner.push(vI0, vI1);
            // this.normalsInner.push(nI0, nI1);
            this.uvsInner.push(uI0, uI1);
          } else if (sign0 === 0) {
            this.points1.push(v0, v1, v2);
            this.normals1.push(n0, n1, n2);
            this.uvs1.push(u0, u1, u2);
            this.pointsInner.push(v0);
            // this.normalsInner.push(n0);
            this.uvsInner.push(u0);
          }
        } else if (sign1 === 1) {
          if (sign0 === -1) {
            const {vI: vI0, nI: nI0, uI: uI0} = this.getIntersectNode(v1, v0, n1, n0, u1, u0);
            const {vI: vI1, nI: nI1, uI: uI1} = this.getIntersectNode(v2, v0, n2, n0, u2, u0);
            this.points2.push(v1, vI1, vI0);
            this.normals2.push(n1, nI1, nI0);
            this.uvs2.push(u1, uI1, uI0);
            this.points2.push(v1, v2, vI1);
            this.normals2.push(n1, n2, nI1);
            this.uvs2.push(u1, u2, uI1);
            this.points1.push(v0, vI0, vI1);
            this.normals1.push(n0, nI0, nI1);
            this.uvs1.push(u0, uI0, uI1);
            this.linesInner.push(vI0, vI1);
            this.pointsInner.push(vI0, vI1);
            // this.normalsInner.push(nI0, nI1);
            this.uvsInner.push(uI0, uI1);
          } else if (sign0 === 0) {
            this.points2.push(v0, v1, v2);
            this.normals2.push(n0, n1, n2);
            this.uvs2.push(u0, u1, u2);
            this.pointsInner.push(v0);
            // this.normalsInner.push(n0);
            this.uvsInner.push(u0);
          }
        } else if (sign1 === 0) {
          if (sign0 === -1) {
            this.points1.push(v0, v1, v2);
            this.normals1.push(n0, n1, n2);
            this.uvs1.push(u0, u1, u2);
            this.linesInner.push(v1, v2);
            this.pointsInner.push(v1, v2);
            // this.normalsInner.push(n1, n2);
            this.uvsInner.push(u1, u2);
          } else if (sign0 === 1) {
            this.points2.push(v0, v1, v2);
            this.normals2.push(n0, n1, n2);
            this.uvs2.push(u0, u1, u2);
            this.linesInner.push(v1, v2);
            this.pointsInner.push(v1, v2);
            // this.normalsInner.push(n1, n2);
            this.uvsInner.push(u1, u2);
          }
        }
      } else if (sign2 === sign0) {
        if (sign2 === -1) {
          if (sign1 === 1) {
            const {vI: vI0, nI: nI0, uI: uI0} = this.getIntersectNode(v2, v1, n2, n1, u2, u1);
            const {vI: vI1, nI: nI1, uI: uI1} = this.getIntersectNode(v0, v1, n0, n1, u0, u1);
            this.points1.push(v2, vI1, vI0);
            this.normals1.push(n2, nI1, nI0);
            this.uvs1.push(u2, uI1, uI0);
            this.points1.push(v2, v0, vI1);
            this.normals1.push(n2, n0, nI1);
            this.uvs1.push(u2, u0, uI1);
            this.points2.push(v1, vI0, vI1);
            this.normals2.push(n1, nI0, nI1);
            this.uvs2.push(u1, uI0, uI1);
            this.linesInner.push(vI0, vI1);
            this.pointsInner.push(vI0, vI1);
            // this.normalsInner.push(nI0, nI1);
            this.uvsInner.push(uI0, uI1);
          } else if (sign1 === 0) {
            this.points1.push(v0, v1, v2);
            this.normals1.push(n0, n1, n2);
            this.uvs1.push(u0, u1, u2);
            this.pointsInner.push(v1);
            // this.normalsInner.push(n1);
            this.uvsInner.push(u1);
          }
        } else if (sign2 === 1) {
          if (sign1 === -1) {
            const {vI: vI0, nI: nI0, uI: uI0} = this.getIntersectNode(v2, v1, n2, n1, u2, u1);
            const {vI: vI1, nI: nI1, uI: uI1} = this.getIntersectNode(v0, v1, n0, n1, u0, u1);
            this.points2.push(v2, vI1, vI0);
            this.normals2.push(n2, nI1, nI0);
            this.uvs2.push(u2, uI1, uI0);
            this.points2.push(v2, v0, vI1);
            this.normals2.push(n2, n0, nI1);
            this.uvs2.push(u2, u0, uI1);
            this.points1.push(v1, vI0, vI1);
            this.normals1.push(n1, nI0, nI1);
            this.uvs1.push(u1, uI0, uI1);
            this.linesInner.push(vI0, vI1);
            this.pointsInner.push(vI0, vI1);
            // this.normalsInner.push(nI0, nI1);
            this.uvsInner.push(uI0, uI1);
          } else if (sign1 === 0) {
            this.points2.push(v0, v1, v2);
            this.normals2.push(n0, n1, n2);
            this.uvs2.push(u0, u1, u2);
            this.pointsInner.push(v1);
            // this.normalsInner.push(n1);
            this.uvsInner.push(u1);
          }
        } else if (sign2 === 0) {
          if (sign1 === -1) {
            this.points1.push(v0, v1, v2);
            this.normals1.push(n0, n1, n2);
            this.uvs1.push(u0, u1, u2);
            this.linesInner.push(v2, v0);
            this.pointsInner.push(v2, v0);
            // this.normalsInner.push(n2, n0);
            this.uvsInner.push(u2, u0);
          } else if (sign1 === 1) {
            this.points2.push(v0, v1, v2);
            this.normals2.push(n0, n1, n2);
            this.uvs2.push(u0, u1, u2);
            this.linesInner.push(v2, v0);
            this.pointsInner.push(v2, v0);
            // this.normalsInner.push(n2, n0);
            this.uvsInner.push(u2, u0);
          }
        }
      } else if (sign0 === 0) {
        if (sign1 === 1) {
          const {vI: vI0, nI: nI0, uI: uI0} = this.getIntersectNode(v1, v2, n1, n2, u1, u2);
          this.points1.push(v0, vI0, v2);
          this.normals1.push(n0, nI0, n2);
          this.uvs1.push(u0, uI0, u2);
          this.points2.push(v0, v1, vI0);
          this.normals2.push(n0, n1, nI0);
          this.uvs2.push(u0, u1, uI0);
          this.linesInner.push(vI0, v0);
          this.pointsInner.push(vI0, v0);
          // this.normalsInner.push(nI0, n0);
          this.uvsInner.push(uI0, u0);
        } else if (sign1 === -1) {
          const {vI: vI0, nI: nI0, uI: uI0} = this.getIntersectNode(v1, v2, n1, n2, u1, u2);
          this.points2.push(v0, vI0, v2);
          this.normals2.push(n0, nI0, n2);
          this.uvs2.push(u0, uI0, u2);
          this.points1.push(v0, v1, vI0);
          this.normals1.push(n0, n1, nI0);
          this.uvs1.push(u0, u1, uI0);
          this.linesInner.push(vI0, v0);
          this.pointsInner.push(vI0, v0);
          // this.normalsInner.push(nI0, n0);
          this.uvsInner.push(uI0, u0);
        }
      } else if (sign1 === 0) {
        if (sign2 === 1) {
          const {vI: vI0, nI: nI0, uI: uI0} = this.getIntersectNode(v0, v2, n0, n2, u0, u2);
          this.points1.push(v1, vI0, v0);
          this.normals1.push(n1, nI0, n0);
          this.uvs1.push(u1, uI0, u0);
          this.points2.push(v1, v2, vI0);
          this.normals2.push(n1, n2, nI0);
          this.uvs2.push(u1, u2, uI0);
          this.linesInner.push(vI0, v1);
          this.pointsInner.push(vI0, v1);
          // this.normalsInner.push(nI0, n1);
          this.uvsInner.push(uI0, u1);
        } else if (sign2 === -1) {
          const {vI: vI0, nI: nI0, uI: uI0} = this.getIntersectNode(v0, v2, n0, n2, u0, u2);
          this.points2.push(v1, vI0, v0);
          this.normals2.push(n1, nI0, n0);
          this.uvs2.push(u1, uI0, u0);
          this.points1.push(v1, v2, vI0);
          this.normals1.push(n1, n2, nI0);
          this.uvs1.push(u1, u2, uI0);
          this.linesInner.push(vI0, v1);
          this.pointsInner.push(vI0, v1);
          // this.normalsInner.push(nI0, n1);
          this.uvsInner.push(uI0, u1);
        }
      } else if (sign2 === 0) {
        if (sign0 === 1) {
          const {vI: vI0, nI: nI0, uI: uI0} = this.getIntersectNode(v1, v0, n1, n0, u1, u0);
          this.points1.push(v2, vI0, v1);
          this.normals1.push(n2, nI0, n1);
          this.uvs1.push(u2, uI0, u1);
          this.points2.push(v2, v0, vI0);
          this.normals2.push(n2, n0, nI0);
          this.uvs2.push(u2, u0, uI0);
          this.linesInner.push(vI0, v2);
          this.pointsInner.push(vI0, v2);
          // this.normalsInner.push(nI0, n2);
          this.uvsInner.push(uI0, u2);
        } else if (sign0 === -1) {
          const {vI: vI0, nI: nI0, uI: uI0} = this.getIntersectNode(v1, v0, n1, n0, u1, u0);
          this.points2.push(v2, vI0, v1);
          this.normals2.push(n2, nI0, n1);
          this.uvs2.push(u2, uI0, u1);
          this.points1.push(v2, v0, vI0);
          this.normals1.push(n2, n0, nI0);
          this.uvs1.push(u2, u0, uI0);
          this.linesInner.push(vI0, v2);
          this.pointsInner.push(vI0, v2);
          // this.normalsInner.push(nI0, n2);
          this.uvsInner.push(uI0, u2);
        }
      }
    }

    if(this.isInnerFaces) this.createInnerFaces();

    const numPoints1 = this.points1.length;
    const numPoints2 = this.points2.length;

    let object1 = null;
    let object2 = null;

    let numObjects = 0;

    if (numPoints1 > 4) {
      object1 = new THREE.Mesh(this.createGeometry(this.points1, this.uvs1, this.normals1), object.material);
      object1.quaternion.copy(object.quaternion);
      numObjects++;
      if(this.isInnerFaces) {
        object1.geometry.computeVertexNormals();
        object1.geometry.applyQuaternion(this.planeQuaternion)
      }
    }

    if (numPoints2 > 4) {
      object2 = new THREE.Mesh(this.createGeometry(this.points2, this.uvs2, this.normals2), object.material);
      object2.quaternion.copy(object.quaternion);
      numObjects++;
      if(this.isInnerFaces) {
        object2.geometry.computeVertexNormals();
        object2.geometry.applyQuaternion(this.planeQuaternion)
      }
    }

    object.geometry.applyQuaternion(this.planeQuaternion)

    const output = {
      object1,
      object2,
      numObjects,
    };
    return output;
  }
}

export {MeshCutter};
