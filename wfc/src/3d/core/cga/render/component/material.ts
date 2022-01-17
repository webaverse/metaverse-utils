import { Thing } from "../thing";
import { GL, createProgram } from "../gl";

export class Material extends Thing {
    constructor() {
        super();
    }

    compile(gl: GL) {
        this.cache = createProgram(gl, { vertexShader: "", fragmentShader: "" });
    }
}