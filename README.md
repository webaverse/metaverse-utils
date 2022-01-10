
## MeshCutter
```
import { MeshCutter } from './MeshCutter.js'

const meshCutter = new MeshCutter()
const plane = new THREE.Plane(new THREE.Vector3(1,0,0), 0)
const output = meshCutter.cutByPlane(mesh, plane)
/*
  output = {
    object1,
    object2,
    numObjects,
  }
*/
```