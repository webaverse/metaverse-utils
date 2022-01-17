import { RGBADepthPacking, MeshDepthMaterial, Vector3, Camera, WebGLRenderer, WebGLRenderTarget, PerspectiveCamera, Scene, Vector4, Matrix4, Mesh, Object3D, Group, Line, LineSegments, BufferGeometry, MeshBasicMaterial, LineBasicMaterial, Material } from 'three';
import { InstancedMesh } from '../instanced/instancedmesh';
import { EventType } from '../dom';

/**
 * 深度选中 位置选取
 */

export const defautDepthMaterial = new MeshDepthMaterial({
    depthPacking: RGBADepthPacking
});

defautDepthMaterial.onBeforeCompile = (shader) => {
    console.log(shader);
    shader.vertexShader = [
        'attribute float states;',
        'varying float vStates;',

        'attribute vec3 instancePosition;',
        'attribute vec4 instanceQuaternion;',
        'attribute vec3 instanceScale;',
        'varying vec3 vInstanceScale;',
        'attribute vec4 instanceData;',
        'varying vec4 vInstanceData;',
        'vec3 applyTRS( vec3 position, vec3 translation, vec4 quaternion, vec3 scale ) {',
        'position *= scale;',
        'position += 2.0 * cross( quaternion.xyz, cross( quaternion.xyz, position ) + quaternion.w * position );',
        'return position + translation;',
        '}',
    ].join('\n') + '\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        [
            "#include <begin_vertex>",
            'vStates = states;',
            "vInstanceData = instanceData;",
            "vInstanceScale = instanceScale;",
            "if(instanceScale.x > 0.0 && instanceScale.y > 0.0 && instanceScale.z > 0.0){",
            "transformed = applyTRS( position, instancePosition, instanceQuaternion, instanceScale );",
            "}"
        ].join('\n')
    );

    shader.fragmentShader = shader.fragmentShader.replace('void main() {', [
        'varying vec3 vInstanceScale;',
        'varying vec4 vInstanceData;',
        'varying float vStates;',
        'void main() {',
        'if(vStates > 0.0 || (vInstanceScale.x > 0.0 && vInstanceScale.y > 0.0 && vInstanceScale.z > 0.0)){',
        "if( vInstanceData.x == 0.0 ) discard;",
        "}"
    ].join('\n'));
};

export const defautColorMaterial = new MeshBasicMaterial({});

export const defautColorLineMaterial = new LineBasicMaterial({});

const projInv = new Matrix4();

export class GPUPicking {
    //单点渲染
    singleTarget: WebGLRenderTarget = new WebGLRenderTarget(1, 1);
    //全屏渲染
    dynamicTarget: WebGLRenderTarget = new WebGLRenderTarget(0, 0);
    _scene: Scene = new Scene();
    pixelBuffer: Uint8Array = new Uint8Array(4)
    pixelAllBuffer: Uint8Array = new Uint8Array(4 * window.outerHeight * window.outerWidth);
    vector4: Vector4 = new Vector4();
    _unpackFactors: Vector4;
    selectId: number = 0;
    /** 允许深度选中来计算当前交点的位置 */
    allowDepth: boolean = true;
    /** 允许颜色选中来计算当前选中的物体 */
    allowColor: boolean = true;
    selectIds: any[] = [];
    indexTable: Map<any, any> = new Map();


    constructor(private _camera: PerspectiveCamera, private _renderer: WebGLRenderer) {
        const unpackDownscale = 255 / 256;
        this._unpackFactors = new Vector4(
            unpackDownscale / (256 * 256 * 256),
            unpackDownscale / (256 * 256),
            unpackDownscale / 256,
            unpackDownscale);
    }

    initEvent() {
        window.addEventListener(EventType.RESET, () => {
            this.dynamicTarget.setSize(this._renderer.domElement.width, this._renderer.domElement.height);
        });
    }

    getId() {
        return this.selectId++;
    }

    addObject(obj: Mesh | Object3D | Group | Line | LineSegments | any, matrixWorld?: Matrix4) {

        (obj as Object3D).traverse((ele: Object3D | any) => {
            if (ele instanceof Mesh) {
                if (Array.isArray(ele.material)) {
                    //是不是合并的几何体
                } else {

                }
            } else if (ele instanceof InstancedMesh) {

            }
        });

        this._scene.add();
    }

    getPointSelect(x: number, y: number) {

    }

    /**
     * 框选
     */
    getRectSelect(x: number, y: number, width: number, height: number) {
        const size = width * height;
        const pixelBuffer = new Uint8Array(size * 4);
        this.dynamicTarget.setSize(width, height);

        this._camera.setViewOffset(this._renderer.domElement.width, this._renderer.domElement.height, x * window.devicePixelRatio | 0, y * window.devicePixelRatio | 0, width, height);

        this._renderer.setRenderTarget(this.dynamicTarget);

        this._renderer.render(this._scene, this._camera);

        this._camera.clearViewOffset();
        this._renderer.setRenderTarget(null);

        this._renderer.readRenderTargetPixels(this.dynamicTarget, 0, 0, width, height, pixelBuffer)

        this.selectIds = [];
        for (var i = 0; i < size; i++) {
            var id = (pixelBuffer[i * 4] << 16) | (pixelBuffer[i * 4 + 1] << 8) | pixelBuffer[i * 4 + 2];
            this.selectIds.push(id);
        }
        return this.selectId;
    }

    /**获取当前场景与鼠标射线的交点 */
    getIntersectionPoint(mouseX: number, mouseY: number): Vector3 | null {
        const pickingScene = this._scene;
        pickingScene.overrideMaterial = defautDepthMaterial;
        //设置相机为鼠标点的一个像素
        this._camera.setViewOffset(this._renderer.domElement.width, this._renderer.domElement.height, mouseX * window.devicePixelRatio | 0, mouseY * window.devicePixelRatio | 0, 1, 1);
        //设置当前渲染目标对象
        this._renderer.setRenderTarget(this.singleTarget);

        //渲染场景到贴图
        this._renderer.render(pickingScene, this._camera);
        //恢复相机尺寸
        this._camera.clearViewOffset();
        //恢复当前渲染目标对象
        this._renderer.setRenderTarget(null);

        //恢复场景所有模型材质
        this._scene.overrideMaterial = null;

        //读取颜色信息到buffer
        this._renderer.readRenderTargetPixels(this.singleTarget, 0, 0, 1, 1, this.pixelBuffer);

        //获取颜色对应的id
        var colorDistance = (this.pixelBuffer[0] << 16) | (this.pixelBuffer[1] << 8) | this.pixelBuffer[2];

        //检测鼠标是否处于空白地方
        if (colorDistance === 0xffffff)
            return null;

        pickingScene.overrideMaterial = null;

        var viewZ = this.computeDepth(this.pixelBuffer, this._camera.far, this._camera.near);
        return this.getPositionFromViewZ(viewZ, mouseX, mouseY, this._camera, this._renderer.domElement.width, this._renderer.domElement.height);

    }

    private computeDepth(pixel: Uint8Array, cf: number, cn: number) {
        // unpackRGBAToDepth()
        var invClipZ = this.vector4.fromArray(pixel)
            .multiplyScalar(1 / 255)
            .dot(this._unpackFactors);
        // perspectiveDepthToViewZ()
        return (cn * cf) / ((cf - cn) * invClipZ - cf);
    };

    private getPositionFromViewZ(viewZ: number, mx: number, my: number, camera: PerspectiveCamera, w: number, h: number) {
        var pos = new Vector3(mx / w * 2 - 1, -(my / h) * 2 + 1, 0.5);
        projInv.getInverse(camera.projectionMatrix);
        pos.applyMatrix4(projInv);
        pos.multiplyScalar(viewZ / pos.z);
        pos.applyMatrix4(camera.matrixWorld);
        return pos;
    };

}