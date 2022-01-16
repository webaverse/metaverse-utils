import { App } from './app';
import { GraphDevice } from './3d/graphdevice';
import { Asset, AssetLoaderManger } from './3d/Asset';
import { Object3D, Vector3 } from 'three';
import { WFCMap } from './3d/wfc/wfc';
import { modules } from './3d/wfc/data';

export const assetData = [
    'ceqiang',
    'cezhu',
    'dice',
    'dice1',
    'diceqiang',
    'dicezhu',
    'dicezhu1',
    'dijiao',
    'dimian',
    'dingce',
    'dingcejiao',
    'dingcejiao1',
    'dingmian',
    'dingmian1',
    'gaodimian',
]

export class Workbench {
    gd: GraphDevice;
    moduleModels: any = {};
    wfcMap: WFCMap;
    ALM: AssetLoaderManger;
    constructor(private app: App, container) {
        this.gd = new GraphDevice({ container });
        this.gd.clearColor = 0x002f4f
        // this.gd.camera.position.set(140.72602198664347, 64.51345552922264, 24.062974315968056)
        this.gd._controls.update()
        this.gd.enableHelper = true
        // this.gd.camera.lookAt(0, 0, 0)
        this.gd.animationFrame();

        this.initScene()
    }

    initScene() {
        this.ALM = new AssetLoaderManger(this.gd);
        for (let i = 0; i < assetData.length; i++) {
            const name = assetData[i];
            this.ALM.add(`../assets/${name}.dae`, (m: Object3D) => {
                m.updateMatrixWorld(true);
                const en = m.children[0].children[1]
                en.applyMatrix4(en.parent.matrixWorld);
                en.matrixWorld.identity();
                en.position.set(-0.5, 0, 0.5);
                this.moduleModels[name] = en;
            })
        }
        this.ALM.load()
        this.gd.on('loadFinish', () => {

            for (let i = 0; i < modules.length; i++) {
                const v = modules[i];
                const model: Object3D = new Object3D().add((this.moduleModels[v.name] || new Object3D()).clone());
                v.mesh = model;
                model.rotation.y = (Math.PI / 2 * v.rotation);
            }

            // for (let j = 0; j < modules.length; j++) {
            //     const module = modules[j];
            //     module.mesh.position.x = Math.floor(j / 4) * 2 - 10
            //     module.mesh.position.z = (j % 4) * 2
            //     console.log(module.mesh.position)
            //     this.gd.add(module.mesh)
            // }
            //modules  global  model and mesh


            this.initMap()
        })

    }
    initMap() {
        this.wfcMap = new WFCMap(new Vector3(8, 3, 8));
        this.gd.add(this.wfcMap);

        this.wfcMap.Collapse(new Vector3)
    }




}