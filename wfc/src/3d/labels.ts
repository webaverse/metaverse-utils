import { debounce, throttle } from './core/utils';
import { HTMLGLLabel, LabelType } from './effect/label';
import { GraphDevice } from './graphdevice';


export class DTLabel extends HTMLGLLabel {
    private _part: string = "";
    private _layer: string = "";
    constructor(gd: GraphDevice, element: string | Element, labelType: LabelType) {
        super(gd, element, labelType);
    }

    set xname(val: string) {
        if (this._part === val)
            return;
        this._part = val;
        var el = this.element.querySelector("#name");
        (el as any).innerText = val;
    }

    set unit(val: string) {
        if (this._part === val)
            return;
        this._part = val;
        var el = this.element.querySelector("#unit");
        (el as any).innerText = val || `A号楼`;
    }


    set part(val: string) {
        if (this._part === val)
            return;
        this._part = val;
        var el = this.element.querySelector("#part");
        (el as any).innerText = val || `1号楼`;
    }

    set layer(val: string) {
        if (this._layer === val)
            return;
        this._layer = val;
        var el = this.element.querySelector("#layer");
        (el as any).innerText = `${val}层`;
    }

    updateLabler() {
        debounce(() => { this.update(true) }, 100)();
    }

    // set part()

}