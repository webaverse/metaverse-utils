
## MeshCutter
```
import { MeshCutter } from './MeshCutter.js'

const meshCutter = new MeshCutter()
const plane = new THREE.Plane(new THREE.Vector3(1,0,0), 0)
const output = meshCutter.cutByPlane(mesh, plane)
/*
  output = {
    object1,   // object1 can be null only in case of internal error.
    object2,   // object2 can be null if the plane doesn't cut the object.
    numObjects,   // number of pieces, 1 or 2. 0 for error.
  }
*/
```