import { Object3D } from 'three';
export default {
    name: 'empty',
    rotation: 0,
    mesh: new Object3D(),
    enableVRotation: false,
    sockets: {
        pX: '-1',
        nX: '-1',
        pY: '-1',
        nY: '-1',
        pZ: '-1',
        nZ: '-1'
    },
    neighbour: {
        pX: [],
        nX: [],
        pY: [],
        nY: [],
        pZ: [],
        nZ: []
    }
}
