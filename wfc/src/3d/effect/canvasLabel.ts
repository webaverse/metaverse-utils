import { CanvasTexture, DoubleSide, Mesh, MeshBasicMaterial, Object3D, PlaneBufferGeometry } from "three";

export class CanvasLabel extends Object3D {
    canvas: HTMLCanvasElement = document.createElement('canvas');
    _text: string = "";
    ctx: CanvasRenderingContext2D = this.canvas.getContext('2d')!;
    planeMesh: Mesh;
    height: number = 64;
    width: number = 64;

    constructor() {
        super();

        this.canvas.width = 512;
        this.canvas.height = 64;

        this.planeMesh = new Mesh(new PlaneBufferGeometry(1, 1),
            new MeshBasicMaterial({
                side: DoubleSide,
                map: new CanvasTexture(this.canvas),
                transparent: true
            }));
        this.add(this.planeMesh);
    }

    drawText(val: string) {

        let ctx = this.ctx;



        //文字的右下角 
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.fillStyle = "#007fff4f";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.font = "64px Arial";
        ctx.textAlign = "start";
        ctx.textBaseline = "middle";
        var tm: TextMetrics = ctx.measureText(val);

        this.height = 48;
        this.width = Math.ceil(tm.width);


        this.planeMesh.scale.x = this.width / this.height * 1;
        this.planeMesh.scale.y = 1;
        ctx.fillText(val, 256 - this.width / 2, 36);
        // (this.planeMesh.material as any).needsUpdate = true;
        (this.planeMesh.material as any).map.needsUpdate = true;
    }
    set text(val: string) {
        this._text = val;
        this.drawText(val);
    }

    set zoom(val: number) {
        this.planeMesh.scale.multiplyScalar(val)
    }


}