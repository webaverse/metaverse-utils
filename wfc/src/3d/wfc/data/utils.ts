import { Vec3 } from '../../core/cga/math/Vec3';

export const createQuaterModule = (module, rotation) => {
    const sockets = module.sockets
    const newSockets = { ...sockets };
    switch (rotation) {
        case 0:
            newSockets.pX = rotateV(sockets.nZ, rotation);
            newSockets.pZ = rotateV(sockets.pX, rotation);
            newSockets.nX = rotateV(sockets.pZ, rotation);
            newSockets.nZ = rotateV(sockets.nX, rotation);
            break;
        case 1:
            newSockets.pX = rotateV(sockets.nZ, rotation);
            newSockets.pZ = rotateV(sockets.pX, rotation);
            newSockets.nX = rotateV(sockets.pZ, rotation);
            newSockets.nZ = rotateV(sockets.nX, rotation);
            break;
        case 2:
            newSockets.pX = rotateV(sockets.nX, rotation);
            newSockets.pZ = rotateV(sockets.nZ, rotation);
            newSockets.nX = rotateV(sockets.pX, rotation);
            newSockets.nZ = rotateV(sockets.pZ, rotation);
            break;
        case 3:
            newSockets.pX = rotateV(sockets.pZ, rotation);
            newSockets.pZ = rotateV(sockets.nX, rotation);
            newSockets.nX = rotateV(sockets.nZ, rotation);
            newSockets.nZ = rotateV(sockets.pX, rotation);
            break;
        default:
            break;
    }

    newSockets.pY = rotateV(sockets.pY, rotation);
    newSockets.nY = rotateV(sockets.nY, rotation);

    const newModule = { ...module };
    newModule.rotation = rotation;
    newModule.moduleName = module.name + '_' + rotation;
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