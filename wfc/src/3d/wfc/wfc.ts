import { Vector3, Object3D } from 'three';
import { IStringDictionary } from '../core/types';
import { Cell } from './Cell';
import { VectoKey } from './data/utils';



export class WFCMap extends Object3D {
    workArea: Array<Cell>;
    RemovalQueue: any;
    size: Vector3 = new Vector3(10, 6, 10);
    pos: Vector3 = new Vector3(0, 0, 0);

    map: IStringDictionary<Cell> = {};
    stack: Array<Cell> = []

    constructor(size: Vector3) {
        super();
        this.size.copy(size);
        this.init();
    }

    init() {
        for (let y = 0; y <= this.size.y; y++) {
            for (let x = -this.size.x; x <= this.size.x; x++) {
                for (let z = -this.size.z; z <= this.size.z; z++) {
                    const key = `${x}_${y}_${z}`;
                    const cell = new Cell(new Vector3(x, y, z), this);
                    this.map[key] = cell;
                    this.add(cell);
                }
            }
        }
    }

    get cells() {
        return this.children;
    }

    CollapseAt(coord: Vector3) {
        const key = VectoKey(coord);
        const cell = this.map[key];
        cell.findPossibleModule()
    }

    Collapse(origin: Vector3) {
        const key = VectoKey(origin);

        let selected: Cell = null;
        selected = this.map[key]
        selected.CollapseRandom();
        this.workArea = this.children.filter((v: Cell) => !v.isCollapsed) as any;

        // this.workArea.forEach((v: Cell) => {
        //     v.module = modules[Math.floor(Math.random() * modules.length)];
        // });
        // return; 



        while (this.workArea.length > 0) {
            //找出最小熵  
            let ci;
            let minEntropy: Number = +Infinity;
            for (let i = 0; i < this.workArea.length; i++) {
                const cell: Cell = this.workArea[i];
                let entropy = cell.entropy;
                if (entropy < minEntropy) {
                    selected = cell;
                    minEntropy = entropy;
                    ci = i;
                }

            }

            try {
                selected.CollapseRandom();
                const spos = this.workArea.indexOf(selected);
                if (spos === -1)
                    return
                this.workArea.splice(spos, 1);
            }
            catch (error) {

                console.error(error);
                return;
                // this.RemovalQueue.Clear();
                // if (this.History.TotalCount > this.backtrackBarrier) {
                //     this.backtrackBarrier = this.History.TotalCount;
                //     this.backtrackAmount = 2;
                // } else {
                //     this.backtrackAmount *= 2;
                // }
                // if (this.backtrackAmount > 0) {
                //     Debug.Log(this.History.Count + " Backtracking " + this.backtrackAmount + " steps...");
                // }
                // this.Undo(this.backtrackAmount);
            }

        }
    }


}