import { Vector3, Object3D } from 'three';
import { modules, newModules } from './data';
import { WFCMap } from './wfc';

export class Cell extends Object3D {
    findPossibleModule() {
        throw new Error('Method not implemented.');
    }

    // Direction -> Module -> Number of items in this.getneighbor(direction).Modules that allow this module as a neighbor 
    public _module: any = null;

    public possibleModules: any[] = newModules();

    _mesh: Object3D;

    PLogP: number = 0

    get entropy() {
        let acc = 0
        this.possibleModules.forEach(v => acc += -v.probability * Math.log(v.probability));
        return acc;
    }

    get isCollapsed() {
        return this._module != null;
    }

    constructor(position: Vector3, private wfcMap: WFCMap) {
        super();
        this.position.copy(position);


    }

    get left() {
        const x = this.position.x - 1;
        const y = this.position.y;
        const z = this.position.z;

        return this.wfcMap.map[`${x}_${y}_${z}`]
    }

    get right() {
        const x = this.position.x + 1;
        const y = this.position.y;
        const z = this.position.z;

        return this.wfcMap.map[`${x}_${y}_${z}`]
    }

    get top() {
        const x = this.position.x;
        const y = this.position.y + 1;
        const z = this.position.z;

        return this.wfcMap.map[`${x}_${y}_${z}`]
    }

    get bottom() {
        const x = this.position.x;
        const y = this.position.y - 1;
        const z = this.position.z;

        return this.wfcMap.map[`${x}_${y}_${z}`]
    }

    get front() {
        const x = this.position.x;
        const y = this.position.y;
        const z = this.position.z + 1;

        return this.wfcMap.map[`${x}_${y}_${z}`]
    }

    get back() {
        const x = this.position.x;
        const y = this.position.y;
        const z = this.position.z - 1;

        return this.wfcMap.map[`${x}_${y}_${z}`]
    }

    reCalcNeigb() {
        if (this.isCollapsed)
            return;

        if (this.position.z === 0)
            this.possibleModules = this.possibleModules.filter(module => module.sockets.nY === '-1')
        else {
            if (this.bottom && this.bottom.isCollapsed) {
                this.possibleModules.filter(module => this.modulesEquals(module.sockets.nY, this.bottom._module.sockets.pY))
            }
        }
        if (this.position.z === this.wfcMap.size.z) {
            this.possibleModules = this.possibleModules.filter(module => module.sockets.nY === '-1')

        } else {
            if (this.top && this.top.isCollapsed) {
                this.possibleModules.filter(module => this.modulesEquals(module.sockets.pY, this.top._module.sockets.nY))
            }
        }

        if (this.left && this.left.isCollapsed) {
            const neighbours = this.left._module.neighbour.pX;
            if (neighbours.length > 0)
                this.possibleModules = neighbours.map(v => modules[v]);
            else
                this.possibleModules.filter(module => this.modulesEquals(module.sockets.nX, this.left._module.sockets.pX))
        }

        if (this.right && this.right.isCollapsed) {
            const neighbours = this.right._module.neighbour.pX;
            if (neighbours.length > 0)
                this.possibleModules = neighbours.map(v => modules[v]);
            else
                this.possibleModules.filter(module => this.modulesEquals(module.sockets.pX, this.right._module.sockets.nX))
        }

        if (this.front && this.front.isCollapsed) {
            const neighbours = this.front._module.neighbour.pX;
            if (neighbours.length > 0)
                this.possibleModules = neighbours.map(v => modules[v]);
            else
                this.possibleModules.filter(module => this.modulesEquals(module.sockets.pZ, this.front._module.sockets.nZ))
        }

        if (this.back && this.back.isCollapsed) {
            const neighbours = this.back._module.neighbour.pX;
            if (neighbours.length > 0)
                this.possibleModules = neighbours.map(v => modules[v]);
            else
                this.possibleModules.filter(module => this.modulesEquals(module.sockets.nZ, this.back._module.sockets.pZ))
        }


    }

    modulesEquals(a, b) {
        if (a[a.length - 1] === 's')
            return a === b;
        if (a[a.length - 1] === 'f')
            return a === b + 'f';
        if (b[b.length - 1] === 'f')
            return a + 'f' === b
        else
            return a === b;
    }

    CollapseRandom() {
        this.reCalcNeigb();

        const len = this.possibleModules.length;
        const ipos = Math.floor(Math.random() * len);

        this.module = this.possibleModules[ipos] || modules['empty'];

        if (this._module) {
            this.left && this.left.reCalcNeigb();
            this.right && this.right.reCalcNeigb();
            this.top && this.top.reCalcNeigb();
            this.bottom && this.bottom.reCalcNeigb();
            this.front && this.front.reCalcNeigb();
            this.back && this.back.reCalcNeigb();
        }
    }

    public set module(m: any) {
        this._module = m;
        if (this._mesh)
            this.remove(this._mesh)

        if (m.mesh) {
            this._mesh = m.mesh.clone();
            this.add(this._mesh);
        }
    }

    public get module() {
        return this._module;
    }


    reset() {
        this.possibleModules = newModules();
    }


}
