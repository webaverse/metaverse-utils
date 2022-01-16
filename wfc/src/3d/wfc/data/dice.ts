export default {
    name: 'dice',
    enableVRotation: true,
    rotation: 0,
    sockets: {
        pX: '0s',
        nX: '9s',
        pY: '-1',
        nY: '-1',
        pZ: '6',
        nZ: '6f'
    },
    neighbour: {
        pX: [],
        nX: [],
        pY: ['empty'],
        nY: ['empty'],
        pZ: [],
        nZ: []
    }
}
