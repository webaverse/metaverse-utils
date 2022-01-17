import { AdditiveBlending, Group, NormalBlending, TextureLoader, Vector4 } from 'three';
import * as THREE from 'three';
import {
    BatchedParticleRenderer, ColorOverLife, ParticleSystem, PointEmitter, RenderMode,
    ConstantValue, ConstantColor, SphereEmitter, SizeOverLife, PiecewiseBezier, Bezier, ColorRange,
    IntervalValue, RandomColor, ConeEmitter, FrameOverLife
} from 'three.quarks';


export class ShipTrail extends THREE.Group {

    constructor() {

        super();

        this.batchRenderer = new BatchedParticleRenderer();

        const texture = new THREE.TextureLoader().load('./textures/texture1.png');
        const texture2 = new THREE.TextureLoader().load('./textures/texture2.png')

        this.beam = new ParticleSystem(this.batchRenderer, {
            duration: 1,
            looping: true,
            startLife: new ConstantValue(1.0),
            startSpeed: new ConstantValue(0),
            startSize: new ConstantValue(20.0),
            startColor: new ConstantColor(new Vector4(0.5220588* 0.772549, 0.6440161* 0.772549, 1 * 0.772549, 0.772549)),
            worldSpace: false,

            maxParticle: 100,
            emissionOverTime: new ConstantValue(1),
            emissionBursts: [],
            shape: new PointEmitter(),
            texture: texture,
            blending: AdditiveBlending,
            startTileIndex: 1,
            uTileCount: 10,
            vTileCount: 10,
            renderOrder: 0,
        });
        this.beam.emitter.name = 'beam';
        this.add(this.beam.emitter);

        this.add(this.beam.emitter);

        this.glowBeam = new ParticleSystem(this.batchRenderer, {
            duration: 1,
            looping: true,
            startLife: new ConstantValue(1),
            startSpeed: new ConstantValue(0),
            startSize: new ConstantValue(10),
            startColor: new ConstantColor(new Vector4(0.3220588* 0.772549, 0.3440161* 0.772549, 1 * 0.772549, 0.172549)),
            worldSpace: true,

            maxParticle: 500,
            emissionOverTime: new ConstantValue(120),

            shape: new SphereEmitter({
                radius: .0001,
                thickness: 1,
                arc: Math.PI * 2,
            }),
            texture: texture,
            blending: AdditiveBlending,
            startTileIndex: 1,
            uTileCount: 10,
            vTileCount: 10,
            renderOrder: 2,
        });
        this.glowBeam.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 1.0, 0.8, 0.5), 0]])));
        this.glowBeam.addBehavior(new ColorOverLife(new ColorRange(new Vector4(1,1,1,1), new Vector4(0,0,0,0))));
        this.glowBeam.emitter.name = 'glowBeam';

        this.add(this.glowBeam.emitter);


        this.particles = new ParticleSystem(this.batchRenderer, {
            duration: 1,
            looping: true,
            startLife: new IntervalValue(0.3, 0.6),
            startSpeed: new IntervalValue(20, 40),
            startSize: new IntervalValue(1, 2),
            startColor: new RandomColor(new Vector4(1,1,1,.5), new Vector4(0.5220588, 0.6440161, 1, 0.772549)),
            worldSpace: false,

            maxParticle: 100,
            emissionOverTime: new ConstantValue(60),

            shape: new ConeEmitter({
                angle: 80 / 180 * Math.PI,
                radius: 1,
                thickness: 0.3,
                arc: Math.PI * 2,
            }),
            texture: texture,
            renderMode: RenderMode.StretchedBillBoard,
            speedFactor: .2,
            blending: NormalBlending,
            startTileIndex: 0,
            uTileCount: 10,
            vTileCount: 10,
            renderOrder: 0,
        });
        this.particles.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.25, 0.05, 0), 0]])));
        this.particles.emitter.rotateY(-Math.PI/2);
        this.particles.emitter.name = 'particles';
        this.add(this.particles.emitter);

        this.electricity = new ParticleSystem(this.batchRenderer, {
            duration: 0.5,
            looping: true,

            startLife: new IntervalValue(0.2, 0.3),
            startSpeed: new ConstantValue(0),
            startSize: new IntervalValue(3, 6),
            startRotation: new IntervalValue(-Math.PI, Math.PI),
            startColor: new RandomColor(new Vector4(0.1397059, 0.3592291, 1, 1), new Vector4(1, 0.9275356, 0.1029412, 1)),
            worldSpace: true,

            maxParticle: 100,
            emissionOverTime: new IntervalValue(5, 10),
            emissionBursts: [],

            shape: new PointEmitter(),
            texture: texture2,
            blending: AdditiveBlending,
            startTileIndex: 0,
            uTileCount: 10,
            vTileCount: 10,
            renderOrder: 2,
        });
        //this.electricity.addBehavior(new ColorOverLife(([[new Bezier(61, 64, 67, 70), 0]])));
        this.electricity.addBehavior(new FrameOverLife(new PiecewiseBezier([[new Bezier(53, 56, 59, 62), 0]])));
        this.electricity.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1.0, 1.0, 0.75, 0), 0]])));
        this.electricity.emitter.name = 'electricity';
        this.add(this.electricity.emitter);

        this.electricBall = new ParticleSystem(this.batchRenderer, {
            duration: 0.4,
            looping: true,

            startLife: new IntervalValue(0.2, 0.4),
            startSpeed: new ConstantValue(0),
            startSize: new IntervalValue(5, 10),
            startRotation: new IntervalValue(-Math.PI, Math.PI),
            startColor: new RandomColor(new Vector4(0.1397059, 0.3592291, 1, 1), new Vector4(1, 0.9275356, 0.1029412, 1)),
            worldSpace: false,

            maxParticle: 100,
            emissionOverTime: new ConstantValue(3),
            emissionBursts: [],

            shape: new PointEmitter(),
            texture: texture2,
            blending: AdditiveBlending,
            startTileIndex: 0,
            uTileCount: 10,
            vTileCount: 10,
            renderOrder: 1,
        });
        this.electricBall.addBehavior(new FrameOverLife(new PiecewiseBezier([[new Bezier(62, 65, 68, 71), 0]])));
        this.electricBall.emitter.name = 'electricBall';
        this.add(this.electricBall.emitter);

        this.userData = {
            script:
                "    this.position.x += delta * 200;\n" +
                "    if (this.position.x > 200)\n" +
                "        this.position.x = -200;\n"
        };
        this.userData.func = new Function("delta", this.userData.script);
    }

    update(delta) {
        this.beam.update(delta);
        this.glowBeam.update(delta);
        // this.particles.update(delta);
        this.electricity.update(delta);
        this.electricBall.update(delta);

        this.batchRenderer.update();
    }

}
