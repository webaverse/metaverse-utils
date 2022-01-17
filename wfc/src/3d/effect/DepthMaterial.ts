import { MeshDepthMaterial, ShaderLib, ShaderMaterial, DepthTexture, WebGLRenderTarget, MeshNormalMaterial } from 'three';


export class NormalDepthMaterial extends MeshNormalMaterial {
    depthTexture: DepthTexture;
    renderTarget: WebGLRenderTarget;
    constructor(width: number, height: number) {
        super();
        this.depthTexture = new DepthTexture(width, height);
        this.renderTarget = new WebGLRenderTarget(width, height, { depthTexture: this.depthTexture })
    }

    setSize(width: number, height: number) {
        this.renderTarget.setSize(width, height);

    }


}