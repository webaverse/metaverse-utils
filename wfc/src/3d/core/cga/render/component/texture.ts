import { Thing } from "../thing";
import { GL } from "../gl"

export class Texture extends Thing {
    constructor() {
        super();

    }

    compile(gl: GL) {
        this.cache = gl.createTexture();
        this.cache as WebGLTexture

    }
}