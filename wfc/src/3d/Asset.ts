import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader"
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader"
import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader"
import { ColladaLoader, Collada } from "three/examples/jsm/loaders/ColladaLoader"
import { CubeTextureLoader, Group, Texture, TextureLoader, CubeTexture, PMREMGenerator } from 'three';
import { lerp } from './core/cga'
import { GraphDevice } from './graphdevice'

export class Asset {
    mtlLoader: MTLLoader = new MTLLoader();
    objLoader: OBJLoader = new OBJLoader();
    fbxLoader: FBXLoader = new FBXLoader();
    gltfLoader: GLTFLoader = new GLTFLoader();
    daeLoader: ColladaLoader = new ColladaLoader();
    textureLoader: TextureLoader = new TextureLoader();
    cubeTextureLoader: CubeTextureLoader = new CubeTextureLoader();
    private static __asset: Asset;
    private currentpath = "";
    constructor() {

    }

    static get Instanced() {
        if (!this.__asset)
            this.__asset = new Asset();
        return this.__asset;
    }

    loadObj(url: string, cb: any, onProgress?: any) {
        var preUrl = url.substr(0, url.lastIndexOf('.'))
        var mtlUrl = preUrl + ".mtl";
        var objUrl = preUrl + ".obj";
        this.mtlLoader.load(mtlUrl, (prematerial) => {
            prematerial.preload();
            this.objLoader.setMaterials(prematerial).load(objUrl, (group: Group) => {
                cb(group);
            })
        })
    }

    loadFBX(url: string, cb: any, onProgress?: any) {
        this.fbxLoader.load(url, (group: Group) => {
            cb(group);
        }, onProgress);
    }

    loadGLTF(url: string, cb: any, onProgress?: any) {
        this.gltfLoader.load(url, (group: GLTF) => {
            cb(group);
        }, onProgress)
    }

    loadDae(url: string, cb?: any, onProgress?: any) {
        this.daeLoader.load(url, (group: Collada) => {
            cb(group.scene, group);
        }, onProgress)
    }

    loadDaeAsync(url: string, onProgress?: any): Promise<any> {
        return this.daeLoader.loadAsync(url, onProgress)
    }


    loadTexture(url: string, cb?: any, onProgress?: any) {
        return this.textureLoader.load(url, (texture: Texture) => {
            if (cb)
                cb(texture);
        }, onProgress)
    }

    loadTextureAsync(url: string, onProgress?: any) {
        return this.textureLoader.loadAsync(url, onProgress)
    }

    load(url: string, cb: any, onProgress?: ((event: ProgressEvent<EventTarget>) => void) | undefined) {
        let ex = url.split('.').pop()
        ex = ex?.toLowerCase();
        switch (ex) {
            case 'obj':
                this.loadObj(url, cb, onProgress)
                break;
            case 'gltf':
            case 'glb':
                this.loadGLTF(url, cb, onProgress);
                break;
            case 'fbx':
                this.loadFBX(url, cb, onProgress);
                break;
            case 'dae':
                this.loadDae(url, cb, onProgress);
            case 'jpg':
            case 'jpge':
            case 'png':
                this.loadTexture(url, cb, onProgress);
                break;
        }
    }

    loadCube(path: string | string[], format: string = 'png', names: string[] = ['px', 'nx', 'py', 'ny', 'pz', 'nz'], cb?: any) {
        if (Array.isArray(path)) {
            return this.cubeTextureLoader.load(path, (texture: CubeTexture) => {
                if (cb)
                    cb(texture);
            })
        }
        else {
            var urls = names.map(e => path + e + '.' + format);
            return this.cubeTextureLoader.load(urls, (texture: CubeTexture) => {
                if (cb)
                    cb(texture);
            })
        }
    }


}


export class AssetLoaderManger {
    _queue: { url: string, cb: any, loadFunc: any }[] = [];
    _totalcount: number = 0;
    _loadcount: number = 0;
    constructor(private gd: GraphDevice) {

    }

    add(url: string, cb?: any, loadFunc?: any) {
        this._queue.push({ url, cb, loadFunc });
        this._totalcount++;
    }

    load() {
        this.loadStep();
    }

    private loadStep() {
        if (this._queue.length === 0)
            return;

        var curObj = this._queue.shift();
        if (curObj) {
            if (curObj.loadFunc) {
                curObj.loadFunc(curObj.url, curObj.cb);

            } else {
                Asset.Instanced.load(curObj.url, (obj: any) => {
                    this._loadcount++;
                    curObj?.cb(obj);
                    if (this._loadcount === this._totalcount)
                        this.gd.fire('loadFinish', this._totalcount);
                    this.loadStep();
                }, (ev: ProgressEvent) => {
                    const cloadRatio = ev.loaded / ev.total;
                    const loadRatio = lerp(this._loadcount / this._totalcount, (this._loadcount + 1) / this._totalcount, cloadRatio);
                    this.gd.fire('loadProgress', loadRatio)
                })
            }
        }

    }
}
