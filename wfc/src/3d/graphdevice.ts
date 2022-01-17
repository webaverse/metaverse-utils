import { WebGLRenderer, Scene, Mesh, MeshPhongMaterial, PerspectiveCamera, Object3D, Vector2, Raycaster, PMREMGenerator, EquirectangularReflectionMapping, Texture, Color, Vector3, CubeTexture, Camera, HemisphereLight, WebGLMultisampleRenderTarget, DirectionalLight, VSMShadowMap, ShadowMapType, RGBFormat, CubeReflectionMapping, CubeCamera, WebGLCubeRenderTarget, AxesHelper, GridHelper } from 'three';
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EventHandler } from './core/eventhandler';
import { GPUPicking } from './core/pick/picking';
import { Asset } from './Asset';
import { Sky } from 'three/examples/jsm/objects/Sky';
import { Pass } from 'three/examples/jsm/postprocessing/Pass';
import { VignetteMapShader } from './effect/vignettemapShader';
import { Nullable, Undefinable } from './core/types';
import TWEEN from '@tweenjs/tween.js'
import { ITimer, Timer } from 'object_frame';

declare global {
  interface Window {
    gd: GraphDevice
  }
}

const raycaster = new Raycaster();
const mouse = new Vector2();
const PMREM = {
  Scene: 0,
  Equirectangular: 1,
  CubeMap: 2

}

export interface GraphDeviceConfig {
  enableHelper?: boolean;
  container?: HTMLElement;
  scene?: Scene;
  enablePostProcessing?: boolean;
  clearColor?: any;
  camera?: PerspectiveCamera;
}

export const defaltGraphDeviceConfig: GraphDeviceConfig = {
  enableHelper: true,
  enablePostProcessing: false,
  clearColor: 0xffffff
}

export class GraphDevice extends EventHandler {
  private _scene: Scene;
  private _modelScene: Object3D;
  private _helperScene: Object3D;
  renderer: WebGLRenderer;
  _container!: HTMLElement;
  _enableSelected: boolean;
  selectedObject: Object3D;
  selecteds: Object3D[];
  timer: Timer;
  _camera!: PerspectiveCamera;
  renderPass: any;
  _gpuPick?: GPUPicking;
  _enablegpuPick: boolean = false;
  _controls: any;

  private _cubeCamera: Undefinable<CubeCamera>

  // Prefiltered, Mipmapped Radiance Environment Map Generator
  private _pmremGenerator?: PMREMGenerator;
  _enablePostProcessing: boolean;
  _enableHelper: boolean;
  _effectComposer: EffectComposer;
  private _transfromControl: any;

  private _postProcessingModule: any = {};

  private _animationFrame: any;
  private _postProcessingObject: any = {};
  multiSamplerenderTarget: WebGLMultisampleRenderTarget;
  sunLight!: DirectionalLight;
  sky!: Sky;
  hemiLight!: HemisphereLight;
  ssaoPass?: SSAOPass;
  focusPass?: ShaderPass;
  currentSelected: Nullable<Mesh> = null;
  selectedMaterial: MeshPhongMaterial = new MeshPhongMaterial({ color: 0xff0000 });
  constructor(config: GraphDeviceConfig = defaltGraphDeviceConfig) {
    super()
    config = { ...defaltGraphDeviceConfig, ...config };
    this._enableSelected = true;
    this.renderer = new WebGLRenderer({
      antialias: true,
      // logarithmicDepthBuffer: true,
    });
    this.container = config.container ?? document.body;


    this._scene = config.scene ? config.scene : new Scene();
    this._scene.name = "allScene";

    this._modelScene = new Object3D();
    this._modelScene.name = "modelScene";

    // 0x9bc4f3
    var hemiLight = new HemisphereLight(0xabcfff, 0x333333, 0.5);
    this._modelScene.add(hemiLight);
    this.hemiLight = hemiLight;

    this.sunLight = new DirectionalLight(0xfffcdd, 0.9);
    this.sunLight.position.set(-20, 40, -20);
    this._modelScene.add(this.sunLight);

    this._scene.add(this._modelScene);

    this._helperScene = new Object3D();
    this._helperScene.name = "helperScene";
    this._scene.add(this._helperScene);


    this.clearColor = config.clearColor;
    this._enableHelper = config.enableHelper ?? false;


    this.selectedObject = new Object3D();
    this.selectedObject.parent = this._scene;
    this.selecteds = this.selectedObject.children;

    this.timer = new Timer();

    this._enablePostProcessing = config.enablePostProcessing ?? false;
    this.multiSamplerenderTarget = new WebGLMultisampleRenderTarget(this.width, this.height, { anisotropy: 10, format: RGBFormat });

    this._effectComposer = new EffectComposer(this.renderer, this.multiSamplerenderTarget)

    this.init(config);

    this.setSize();

    this._animationFrame = this.animationFrame.bind(this);

    this.initBasicPostProcessing();
  }

  init(settings: GraphDeviceConfig) {
    this._camera = settings.camera ?? new PerspectiveCamera(45, 1, 0.1, 2000);
    this._camera.position.set(-62, 28, 28);
    this._camera.name = "默认相机";
    this._controls = new OrbitControls(this._camera, this.domElement);
    this._controls.minPolarAngle = Math.PI / 10
    this.scene.add(this._camera);

    //  this. sky = new Sky();
    // this. sky.scale.setScalar(450000);
    // this.add(this. sky);

    this._helperScene.add(new AxesHelper(10000));
    this._helperScene.add(new GridHelper(100, 10));

  }

  goto(position: any, target: any, duration = 1000) {
    const orgPosition = this.camera.position.clone();
    const orgTarget = this._controls.target.clone();
    var tween = new TWEEN.Tween({ t: 0 }).to({ t: 1 })
      .duration(duration)
      .onUpdate(function (v) {
        this.camera.positon.lerpVectors(orgPosition, position, v.t)
        this._controls.target.lerpVectors(orgTarget, target, v.t)
      }).onComplete(function () {

      }).start()
  }

  /**设置当前画布的容器 */
  set container(value: HTMLElement) {
    if (!value)
      return;
    this._container = value;
    this._container.appendChild(this.renderer.domElement);
  }

  /**获取当前画布的容器 */
  get container() {
    return this._container;
  }


  set modelScene(val: Object3D) {
    this.scene.remove(this._modelScene);
    this._modelScene = val;
    this._scene.add(val);
  }

  get modelScene(): Object3D {
    return this._modelScene;
  }

  /**
   * 是否显示辅助器件
   *
   **/
  set enableHelper(val: boolean) {
    this._enableHelper = val;
    this._helperScene.visible = val;
  }

  get enableHelper() {
    return this._enableHelper;
  }

  set helperScene(val: Object3D) {
    this._helperScene = val;
    this.add(val);
  }

  /**获取场景辅助 */
  get helperScene(): Object3D {
    return this._helperScene;
  }

  /**背景清除颜色 */
  set clearColor(val: Color | number | any) {
    val = val ?? 0xaaeeff
    this.renderer.setClearColor(<Color>val)
  }

  set transfromMode(mode: any) {
    this._transfromControl.setMode(mode);
  }

  get cubeCamera() {
    if (!this._cubeCamera)
      this._cubeCamera = new CubeCamera(0.1, 1000, new WebGLCubeRenderTarget(1024))

    return this._cubeCamera;
  }

  attach(model: any) {
    if (!model) {
      this.detach()
    } else {
      this._controls.enabled = false;
    }
  }

  detach() {
    this._transfromControl.detach();
    this._controls.enabled = true;
  }

  get pmremGenerator() {
    if (!this._pmremGenerator)
      this._pmremGenerator = new PMREMGenerator(this.renderer);

    return this._pmremGenerator;
  }

  pmrenvMap(texture: Texture | CubeTexture | Scene | any): Texture {
    if (!this._pmremGenerator)
      this._pmremGenerator = new PMREMGenerator(this.renderer);

    var _pmremRendererTarget;

    if (texture.isCubeTexture) {
      (texture as Texture).mapping = CubeReflectionMapping;
      this._pmremGenerator.compileCubemapShader();
      _pmremRendererTarget = this._pmremGenerator.fromCubemap(<CubeTexture>texture);
      return _pmremRendererTarget.texture;
    } else if (texture.isTexture) {
      (texture).mapping = EquirectangularReflectionMapping;
      this._pmremGenerator.compileEquirectangularShader();
      _pmremRendererTarget = this._pmremGenerator.fromEquirectangular(texture);
      return _pmremRendererTarget.texture;
    } else /* if (texture.isScene) */ {
      this._pmremGenerator.compileCubemapShader();
      _pmremRendererTarget = this._pmremGenerator.fromScene(texture || this.scene);
      return _pmremRendererTarget.texture;
    }
  }

  set toneExposure(val: any) {
    this.renderer.toneMappingExposure = val;
  }

  get camera() {
    return this._camera;
  }

  set camera(value) {
    this._camera = value;
    this._controls.camera = value;
  }

  get scene() {
    return this._scene;
  }
  set scene(value) {
    this._scene = value;
  }

  get width() {
    return this.domElement.width;
  }
  get height() {
    return this.domElement.height;
  }


  get domElement() {
    return this.renderer.domElement;
  }

  initBasicPostProcessing() {
    this.addPostProcessingModule('ssao', SSAOPass, { scene: this.scene, camera: this.camera, width: this.width, height: this.height })
    this.addPostProcessingModule('bloom', UnrealBloomPass, { resolution: new Vector2(this.width, this.height), strength: 0.5, radius: 0.4, threshold: 0.01 });
  }

  get enablePostProcessing() { return this._enablePostProcessing }
  set enablePostProcessing(value) {
    this._enablePostProcessing = value;
    if (!value)
      return
    if (!this.renderPass) {
      this._effectComposer.setSize(this.width, this.height);
      this.renderPass = new RenderPass(this._scene, this._camera);
      this._effectComposer.addPass(this.renderPass);
    }


  }
  enableSSAO() {
    this._enablePostProcessing = true;
    if (!this.ssaoPass) {

      this.ssaoPass = new SSAOPass(this._scene, this._camera, this.width, this.height);
      this.ssaoPass.kernelRadius = 30;
      this.ssaoPass.minDistance = 0.005;
      this.ssaoPass.maxDistance = 1000;
      // this.ssaoPass.output = SSAOPass.OUTPUT.Beauty; 
      this._effectComposer.addPass(this.ssaoPass);
    }
    this.ssaoPass.enabled = true;
    if (this.renderPass)
      this.renderPass.enabled = false;
  }

  addPostProcessingModule(name: string, passClass: any = Vector3, params: any) {
    name = name.toLowerCase();
    this._postProcessingModule[name] = passClass
    this._postProcessingModule[name].params = params;
  }

  setPPMValue(key: string, name: string, val: any) {
    key = key.toLowerCase();
    const pppObject = this._postProcessingObject[key];

    if (pppObject) {
      if (pppObject[name] && pppObject[name].copy)
        pppObject[name].copy(val);
      else
        pppObject[name] = val;
    }
  }

  enablePPM(key: string) {
    key = key.toLowerCase();
    const pppModule = this._postProcessingModule[key] as SSAOPass;

    if (!this.enablePostProcessing)
      this.enablePostProcessing = true;

    if (!this._postProcessingObject[key] && pppModule) {

      const object = new UnrealBloomPass(new Vector2(this.width, this.height), 0.3, 0.1, 0.1);
      this._postProcessingObject[key] = object;
      this._postProcessingObject[key].enable = true;
    }

    if (this._effectComposer.passes.indexOf(this._postProcessingObject[key]) === -1)
      this._effectComposer.addPass(this._postProcessingObject[key]);

    return this._postProcessingObject[key]
  }

  disablePPM(key: string) {

    key = key.toLowerCase();
    const pppObject = this._postProcessingObject[key];

    if (pppObject) {
      var idpos = this._effectComposer.passes.indexOf(pppObject);
      if (idpos !== -1)
        this._effectComposer.passes.splice(idpos, 1);
    }
  }

  addPass(pass: Pass) {
    this._effectComposer.addPass(pass)
  }

  removePass(pass: Pass) {
    var index = this._effectComposer.passes.indexOf(pass);
    if (index !== -1)
      this._effectComposer.passes.splice(index, 1);
  }

  /**
   * 向场景添加模型
   * @param  {Object3D} object 模型
   */
  add(object: Object3D) {
    this._modelScene.add(object);
    return this;
  }
  /**
   * 场景移除模型
   * @param  {Object3D} object 模型
   */
  remove(object: Object3D) {
    this._modelScene.remove(object);
    return this;
  }


  mouse2glPos(x: number, y: number, left: number, top: number, width: number, height: number): Vector2 {
    mouse.x = ((x - left) / width) * 2 - 1;
    mouse.y = -((y - top) / height) * 2 + 1;
    return mouse;
  }

  /**
   * GPU 获取模型模型位置
   */
  getGPUPick(mouseX: number, mouseY: number) {
    this._gpuPick?.getIntersectionPoint(mouseX, mouseY);
  }

  /**
  * 设置渲染DOM的宽高 更新相机 更新PostProcessing
  * @param  {} width
  * @param  {} height
  */
  setSize(width: number = this.container.clientWidth, height: number = this.container.clientHeight) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);

    if (this._enablePostProcessing)
      this._effectComposer.setSize(width, height);
    if (this.multiSamplerenderTarget)
      this.multiSamplerenderTarget.setSize(width, height);
  }


  /**
   * 世界坐标投影到屏幕坐标
   * @param  {Vector3} v3 世界坐标
   */
  project(v3: Vector3) {
    return v3.project(this.camera);
  }

  /**
  * 将屏幕点反投影到世界坐标
  * @param  {} v3
  */
  unproject(v3: Vector3) {
    return v3.unproject(this.camera);
  }

  /**
   * 世界坐标中的点对应document坐标
   * @param  {} v3
   */
  getScreenPosition(v3: Vector3) {
    v3 = this.project(v3);
    let rect = this.domElement.getBoundingClientRect();
    let x = ((v3.x + 1) / 2) * this.width + rect.left;
    let y = -((v3.y - 1) / 2) * this.height + rect.top;

    return new Vector2(x, y);
  }



  /**
   * 从一个坐标点获取模型
   * @param v2  一个坐标点
   * @param isMousePos  坐标点是鼠标点  还是已经转化好的点 =true是转化好了的点
   * @param object   要进行拾取操作的对相机
   * @param first  是否只显示有交集第一个
   */
  getSelect(evpos: Vector2 | MouseEvent, isMousePos = true, object: any = null, first = false) {
    var v2 = mouse;
    if (isMousePos) {
      let rect = this.domElement.getBoundingClientRect();
      if (evpos instanceof MouseEvent) {
        v2.x = ((evpos.clientX - rect.left) / this.width) * 2 - 1;
        v2.y = -((evpos.clientY - rect.top) / this.height) * 2 + 1;
      } else {
        v2.x = ((evpos.x - rect.left) / this.width) * 2 - 1;
        v2.y = -((evpos.y - rect.top) / this.height) * 2 + 1;
      }
    }
    //渲染区域之外
    if (v2.x < -1 || v2.x > 1 || v2.y < -1 || v2.y > 1) return null;

    raycaster.setFromCamera(v2, this.camera);
    let intersects;
    if (object) {
      if (Array.isArray(object))
        intersects = raycaster.intersectObjects(object, true);
      else
        intersects = raycaster.intersectObject(object, true);
    }
    else
      intersects = raycaster.intersectObject(this.modelScene, true);

    if (intersects.length > 0) {
      if (first) return intersects[0];
      else return intersects;
    }
    return null;
  }

  /**
   * 按条件寻找符合条件的父对象
   * @param object
   * @param callbak
   */
  getUserParent(object: Object3D, callbak: (arg0: Object3D) => boolean): Object3D | null {
    let parent = object;

    while (parent) {
      if (callbak(parent))
        return parent;
      if (parent.parent)
        parent = parent.parent;
    }
    return null;
  }

  /**
   * 按照名字要求去找符合条件的父对象
   * @param object
   * @param subName
   */
  getUserParentBySubName(object: Object3D, subName: string): Object3D | null {
    return this.getUserParent(object, (obj: Object3D) => {
      if (obj.name.indexOf(subName) > -1)
        return true;
      return false;
    })
  }

  /**
   * 设置要选中的模型为选中状态
   * @param  {} models
   */
  selectModels(models: any) {
    let ary = Array.isArray(models) ? models : [models];

    //unselected
    this.unselect();

    //selected
    this.select(ary);
  }

  select(models: any[] | undefined) {
    if (!this._enableSelected) return;

    let ary;
    if (models === undefined) ary = this.selecteds;

    else ary = Array.isArray(models) ? models : [models];
    this.selecteds.push(...ary);
  }

  /**
   * 取消模型的选中状态
   * @param  {} models
   */
  unselect(models?: any) {
    this._controls.detach();

  }
  /**
   * 判断点是否在渲染区域（是否可见）
   * @param  {} v3
   */
  inRendererArea(v3: Vector3) {
    v3 = this.project(v3);
    return !(v3.x > 1 || v3.x < -1 || v3.y > 1 || v3.y < -1);
  }


  render(deltaTime?: ITimer) {
    this.renderer.clearColor();
    if (this._enablePostProcessing)
      this._effectComposer.render()
    else
      this.renderer.render(this._scene, this._camera);
  }

  animationFrame() {
    this.fire("update", this.timer.deltaElapsed);

    this.render(this.timer.deltaElapsed);

    requestAnimationFrame(this._animationFrame);
  }


  toggleVisible(obj: { visible: boolean; }) {
    obj.visible = !obj.visible;
  }

  hide(obj: { visible: boolean; }) {
    obj.visible = false;
  }

  hideOther(obj: { traverse: (arg0: (e: any) => void) => void; visible: boolean; parent: any; }) {
    this.modelScene.traverse((e: { visible: boolean; }) => {
      e.visible = false;
    });
    obj.traverse((e: { visible: boolean; }) => {
      e.visible = true;
    });
    this.modelScene.visible = true;
    while (obj !== this.modelScene) {
      obj.visible = true;
      obj = obj.parent;
    }
  }

  showAll() {
    this.modelScene.traverse((e: { visible: boolean; }) => {
      e.visible = true;
    });
  }

  /**
   * 预先编译shader
   * @param object 带有材质的对象
   * @param camera 相机
   */
  preCompileMaterial(object: Object3D, camera: Camera = this.camera) {
    this.renderer.compile(object, camera);
  }

  /**启用gpupick */
  set enablegpuPick(val: boolean) {
    this._enablegpuPick = val;
    if (!this._gpuPick && this._enablegpuPick)
      this._gpuPick = new GPUPicking(this.camera, this.renderer);
  }

  get enablegpuPick(): boolean {
    return this._enablegpuPick;
  }

  //---用API-----------------------------------------------------------------------
  load(url: string, cb: any) {
    Asset.Instanced.load(url, cb);
  }

  /**
   * 开启纹理DOF
   * @param texture 
   */
  enableFocusPass(texture?: Texture) {
    if (!this.focusPass) {
      this.focusPass = new ShaderPass(VignetteMapShader);
      if (!texture)
        this.focusPass.uniforms['tMask'].value = Asset.Instanced.loadTexture("./assets/texture/dof/Depth.png");
      this._effectComposer.addPass(this.focusPass);
    }

    if (texture)
      this.focusPass.uniforms['tMask'].value = texture;
  }

  disableFocusPass() {
    if (this.focusPass)
      this.focusPass.enabled = false
  }



  enbaleShadow(shadowtype: ShadowMapType = VSMShadowMap) {
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = shadowtype;
    this.sunLight.castShadow = true;
    var width = 50
    this.sunLight.shadow.camera.near = 0.1;
    this.sunLight.shadow.camera.far = 5000;
    this.sunLight.shadow.camera.right = width;
    this.sunLight.shadow.camera.left = - width;
    this.sunLight.shadow.camera.top = width;
    this.sunLight.shadow.camera.bottom = - width;
    this.sunLight.shadow.mapSize.width = window.innerWidth;
    this.sunLight.shadow.mapSize.height = window.innerHeight;
    this.sunLight.shadow.radius = 5;
    this.sunLight.shadow.bias = -0.0001;
    this.sunLight.shadow.camera.position.z = 50;
  }


  sun() {
    var sunpos = this.sunLight.position;

    var uniforms = this.sky.material.uniforms;
    uniforms["turbidity"].value = 10;
    uniforms["rayleigh"].value = 3;
    uniforms["mieCoefficient"].value = 0.005;
    uniforms["mieDirectionalG"].value = 0.7;

    var theta = Math.PI * (0.3 - 0.5);
    var phi = 2 * Math.PI * (0.15 - 0.5);

    sunpos.x = Math.cos(phi);
    sunpos.y = Math.sin(phi) * Math.sin(theta);
    sunpos.z = Math.sin(phi) * Math.cos(theta);

    uniforms["sunPosition"].value.copy(sunpos);
  }


  /**
   * 生成模型预览图
   * @param model 
   */
  previewModel(model: Object3D) {
    const preRenderer = new WebGLRenderer({ antialias: true })
    const preScene = new Scene();
    const preCamera = new PerspectiveCamera();

    preScene.add(model);

    preRenderer.render(preScene, preCamera);

    return this.domElement.toDataURL();
  }
}
