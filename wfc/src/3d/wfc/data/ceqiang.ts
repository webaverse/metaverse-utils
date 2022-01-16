export default {
    name: 'ceqiang',
    rotation: 0,
    enableVRotation: true,
    probability: 1,
    sockets: {
        pX: '-1',
        nX: '-1',
        pY: 'v8_0',
        nY: 'v8_0',
        pZ: '8f',
        nZ: '8'
    },
    neighbour: {
        pX: ['empty'],
        nX: ['empty'],
        pY: [],
        nY: [],
        pZ: ['ceqiang', 'cezhu'],
        nZ: ['ceqiang', 'cezhu']
    }
}
