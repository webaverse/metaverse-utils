import { Thing } from "../thing";

export class Component extends Thing {
    isComponent: boolean = true;
    constructor() {
        super();
    }
}