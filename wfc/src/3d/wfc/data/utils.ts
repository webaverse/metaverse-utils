import { Vec3 } from '../../core/cga/math/Vec3';

export const createQuaterModule = (module, rotation) => {
    const sockets = module.sockets
    const neighbour = module.neighbour
    const newSockets = { ...sockets };
    const newModule = { ...module };
    switch (rotation) {
        case 0:
            newSockets.pX = rotateV(sockets.pX, rotation);
            newSockets.pZ = rotateV(sockets.pZ, rotation);
            newSockets.nX = rotateV(sockets.nX, rotation);
            newSockets.nZ = rotateV(sockets.nZ, rotation);
            newModule.neighbour.pX = [...neighbour.pX];
            newModule.neighbour.pZ = [...neighbour.pZ];
            newModule.neighbour.nX = [...neighbour.nX];
            newModule.neighbour.nZ = [...neighbour.nZ];
            break;
        case 1:
            newSockets.pX = rotateV(sockets.nZ, rotation);
            newSockets.pZ = rotateV(sockets.pX, rotation);
            newSockets.nX = rotateV(sockets.pZ, rotation);
            newSockets.nZ = rotateV(sockets.nX, rotation);
            newModule.neighbour.pX = [...neighbour.nZ];
            newModule.neighbour.pZ = [...neighbour.pX];
            newModule.neighbour.nX = [...neighbour.pZ];
            newModule.neighbour.nZ = [...neighbour.nX];
            break;
        case 2:
            newSockets.pX = rotateV(sockets.nX, rotation);
            newSockets.pZ = rotateV(sockets.nZ, rotation);
            newSockets.nX = rotateV(sockets.pX, rotation);
            newSockets.nZ = rotateV(sockets.pZ, rotation);
            newModule.neighbour.pX = [...neighbour.nX];
            newModule.neighbour.pZ = [...neighbour.nZ];
            newModule.neighbour.nX = [...neighbour.pX];
            newModule.neighbour.nZ = [...neighbour.pZ];
            break;
        case 3:
            newSockets.pX = rotateV(sockets.pZ, rotation);
            newSockets.pZ = rotateV(sockets.nX, rotation);
            newSockets.nX = rotateV(sockets.nZ, rotation);
            newSockets.nZ = rotateV(sockets.pX, rotation);
            newModule.neighbour.pX = [...neighbour.pZ];
            newModule.neighbour.pZ = [...neighbour.nX];
            newModule.neighbour.nX = [...neighbour.nZ];
            newModule.neighbour.nZ = [...neighbour.pX];
            break;
        default:
            break;
    }

    newSockets.pY = rotateV(sockets.pY, rotation);
    newSockets.nY = rotateV(sockets.nY, rotation);

    newModule.rotation = rotation;
    newModule.modelName = module.name;
    newModule.name = module.name + '_' + rotation;
    newModule.sockets = newSockets;
    return newModule;
}

function rotateV(str: string, rotation: number) {
    if (str[0] === 'v') {
        let nstr = str.substring(0, str.length - 1);
        nstr += (parseInt(str[str.length - 1]) + rotation) % 4
        return nstr;
    }
    return str;
}

export function VectoKey(coord): string {
    return coord.x + '_' + coord.y + '_' + coord.z;
}

export function KeytoVec(key: string): Vec3 {
    const ns: number[] = key.split('_').map(v => parseInt(v));
    return new Vec3(ns[0], ns[1], ns[2]);
}