import { Mesh, Material, PlaneBufferGeometry, Vector2, MeshBasicMaterial, PerspectiveCamera, Vector3, Texture, Sprite, CanvasTexture, DoubleSide, MeshStandardMaterial, SpriteMaterial, SpriteMaterialParameters, Object3D } from 'three';
import html2canvas from 'html2canvas'
import { GraphDevice } from '../graphdevice';
import { getTotalHeight, getTotalWidth, getTotalScrollWidth } from '../core/dom';

export enum LabelType {
    UI,
    Sprite,
    Mesh,
    HTML,
}
//
export class HTMLGLLabel extends Object3D {
    _canvas: HTMLCanvasElement = document.createElement('canvas');
    option: any = {};
    canvasTexture: CanvasTexture;
    element!: HTMLElement;
    oldDisplay: string | null = null;
    constructor(private gd: GraphDevice, private _element: string | Element, private _type: LabelType = LabelType.Sprite) {
        super();
        this.canvasTexture = new CanvasTexture(this._canvas);
        this.update();
        let material: any;
        switch (this._type) {
            case LabelType.Mesh:
                var geometry = new PlaneBufferGeometry(1, 1);
                geometry.translate(0, 0.5, 0);
                // this.cen
                material = new MeshBasicMaterial({ map: this.canvasTexture, transparent: true, side: DoubleSide });
                this.add(new Mesh(geometry, material));
                break;
            case LabelType.Sprite:
                material = new SpriteMaterial({ map: this.canvasTexture, sizeAttenuation: true })
                var sprite = new Sprite(material);
                sprite.center.set(0, 0.5);
                sprite.renderOrder = 1000;
                this.add(sprite);
                break;
            default:
                break;
        }
    }
    set centerx(v: number) {

    }
    set centery(v: number) {

    }
    get renderObject() {
        return this.children[0];
    }
    set visiblity(val: boolean) {
        if (this._type === LabelType.HTML) {
            if (!val) {
                this.element.style.display = "none";
            }
            else {
                this.element.style.display = "";
            }
        } else {
            this.visible = val
        }
    }
    set width(val: number) {
        this.scale.x = val;
    }

    set height(val: number) {
        this.scale.y = val;
    }

    set posX(val: number) {
        if (this._type === LabelType.HTML)
            this.element.style.left = `${val}px`;
    }
    set posY(val: number) {
        if (this._type === LabelType.HTML)
            this.element.style.top = `${val}px`;
    }



    update(retain?: boolean) {

        var option = this.option;
        let element: HTMLElement;
        if (typeof (this._element) === 'string') {
            document.body.insertAdjacentHTML('beforeend', this._element);
            element = document.body.lastChild! as HTMLElement;
        }
        else {
            element = this._element as any;
            if (!element.parentNode)
                element.remove();

            document.body.insertAdjacentElement('beforeend', this._element);
        }


        if (!this.element)
            this.element = element;
        // element.style.zIndex = "-1";
        if (this._type === LabelType.HTML) {
            element.style.zIndex = "9";
            return;
        }

        this._canvas.width = getTotalWidth(element) //Math.max(getTotalWidth(element), element.offsetWidth);
        this._canvas.height = getTotalHeight(element)//Math.max(getTotalHeight(element), element.scrollHeight);

        html2canvas(element, {
            backgroundColor: null,
            scale: 1,
            canvas: this._canvas,
            useCORS: true,
        }).then((canvas: HTMLCanvasElement) => {
            if (canvas !== this._canvas)
                debugger

            this.canvasTexture.needsUpdate = true;
            if (!retain)
                element.remove();
            // document.body.removeChild(element);
        })

    }

}

export function createHtmlCanvas(option: any) {
    option.scale = option.scale || [1, 1, 1];
    option.position = option.position || [0, 0, 0];
    // document.body.insertAdjacentHTML('beforeend', option.element)
    const element: HTMLElement = option.element;
    element.style.zIndex = "-1"
    html2canvas(element, { backgroundColor: null, scale: option.domScale || 2, canvas: option.canvas }).then((canvas: HTMLCanvasElement) => {
        option.position = option.position || [0, 0, 0]
        let html
        if (option.type === 'plane') {
            html = new Mesh(new PlaneBufferGeometry(option.width || 100, option.height || 100, 10), new MeshBasicMaterial({
                map: new CanvasTexture(canvas),
                transparent: true,
                side: DoubleSide
            }))
        } else {
            html = new Sprite(new SpriteMaterial({
                map: new CanvasTexture(canvas),
                transparent: true,
                sizeAttenuation: option.sizeAttenuation || true
            }))
        }
        html.scale.set(option.scale[0], option.scale[1], option.scale[2])
        html.position.set(option.position[0], option.position[1], option.position[2])
        html.name = option.name || 'canvas-sprite'
        if (option.parent)
            option.parent.add(html)
        if (option.callback)
            option.callback(html)
        // document.body.removeChild(element)
    })
}


export class Panel extends Mesh {
    /**
     * 是否保存始终对其Y轴
     */
    fixedY: boolean;
    camerPos = new Vector3();
    constructor(private gd: GraphDevice, material?: Material | Material[], option: any = { isSprite: true }) {
        super();
        this.material = material ?? new MeshBasicMaterial();

        this.geometry = new PlaneBufferGeometry(1, 1);

        this.geometry.translate(0, 0.5, 0);


        this.fixedY = true;
        if (option.isSprite)
            this.gd.on('update', () => {
                this.update(this.gd.camera);
            });
    }

    update(camera: PerspectiveCamera) {
        this.camerPos.copy(camera.position);
        if (this.fixedY) {
            this.camerPos.y = 0;
            this.lookAt(this.camerPos)
        } else
            this.lookAt(this.camerPos)

    }

    get width() {
        return this.scale.x;
    }

    set width(val: number) {
        this.scale.x = val;
    }

    get height() {
        return this.scale.y;
    }

    set height(val: number) {
        this.scale.y = val;
    }

}

