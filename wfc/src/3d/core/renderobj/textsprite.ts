import { Object3D, CanvasTexture as Texture, LinearFilter, SpriteMaterial, Sprite } from "three";

export class TextSprite extends Object3D {
    material: SpriteMaterial;
    sprite: Sprite;
    borderThickness: number;
    fontface: string;
    fontsize: number;
    _borderColor: any;
    _backgroundColor: any;
    _textColor: any;
    text: string;
    _canvas: HTMLCanvasElement;
    _texture: Texture;
    constructor(text: string) {
        super();

        this._canvas = document.createElement('canvas');
        this._texture = new Texture(this._canvas);
        this._texture.minFilter = LinearFilter;
        this._texture.magFilter = LinearFilter;
        this.material = new SpriteMaterial({
            map: this._texture,
            depthTest: false,
            depthWrite: false
        });

        this.sprite = new Sprite(this.material);
        this.add(this.sprite);

        this.borderThickness = 4;
        this.fontface = 'Arial';
        this.fontsize = 28;
        this._borderColor = { r: 0, g: 0, b: 0, a: 1.0 };
        this._backgroundColor = { r: 0, g: 0, b: 0, a: 1.0 };
        this._textColor = { r: 255, g: 255, b: 255, a: 1.0 };
        this.text = '';

        this.setText(text);
    }

    setText(text: string) {
        if (this.text !== text) {
            this.text = text;
            this.update();
        }
    };
    set textColor(color: any) {
        this._textColor = color;
        this.update();
    }
    set borderColor(color: any) {
        this._borderColor = color;
        this.update();
    }
    set backgroundColor(color: any) {
        this._backgroundColor = color;
        this.update();
    }

    update() {
        const context = this._canvas.getContext('2d')!;
        context.font = 'Bold ' + this.fontsize + 'px ' + this.fontface;

        // get size data (height depends only on font size)
        const metrics = context.measureText(this.text);
        const textWidth = metrics.width;
        const margin = 2;
        const spriteWidth = 2 * margin + textWidth;// + 2 * this.borderThickness;
        const spriteHeight = this.fontsize * 1.4;//+ 2 * this.borderThickness;

        this._canvas.width = spriteWidth;
        this._canvas.height = spriteHeight;
        context.clearRect(0, 0, spriteWidth, spriteHeight);
        context.font = 'Bold ' + this.fontsize + 'px ' + this.fontface;

        // background color
        context.fillStyle = 'rgba(' + this._backgroundColor.r + ',' + this._backgroundColor.g + ',' +
            this._backgroundColor.b + ',' + this._backgroundColor.a + ')';
        // border color
        context.strokeStyle = 'rgba(' + this._borderColor.r + ',' + this._borderColor.g + ',' +
            this._borderColor.b + ',' + this._borderColor.a + ')';
        context.fill();
        context.stroke();

        context.lineWidth = this.borderThickness;
        // this.roundRect(context, this.borderThickness / 2, this.borderThickness / 2,
        //     textWidth + this.borderThickness + 2 * margin, this.fontsize * 1.4 + this.borderThickness, 6);

        // text color
        // context.strokeStyle = 'rgba(0, 0, 0, 1.0)';
        // context.strokeText(this.text, this.borderThickness + margin, this.fontsize + this.borderThickness);

        context.fillStyle = 'rgba(' + this._textColor.r + ',' + this._textColor.g + ',' + this._textColor.b + ',' + this._textColor.a + ')';
        context.fillText(this.text, this.borderThickness + margin, this.fontsize + this.borderThickness);

        this._texture.needsUpdate = true;

        this.sprite.scale.set(spriteWidth * 0.1, spriteHeight * 0.1, 1.0);
        this.sprite.rotation.y = Math.PI / 3;
    }

    roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}