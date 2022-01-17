import { Color } from "three";

export const FocusShader = {

    uniforms: {

        "tDiffuse": { value: null },
        "tMask": { value: null },
        "color": { value: new Color(0xffffff) }

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

        "	vUv = uv;",
        "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),

    fragmentShader: [

        "uniform vec3 color;",
        "uniform sampler2D tDiffuse;",
        "uniform sampler2D tMask;",

        "varying vec2 vUv;",

        "void main() {",

        "	vec4 texel = texture2D( tDiffuse, vUv );",
        "	vec4 mask = texture2D( tMask, vUv );",
        "   vec4 outColor = vec4(0.0,0.0,0.0,texel.a);",
        "   vec3 outColor1 = mix(texel.rgb, mask.rgb,mask.a);",
        "   outColor.rgb = outColor1;",
        // `   if( mask.a > 0.5)
        //         mask.r= 1.0;
        // `,
        "	gl_FragColor = outColor;",

        "}"

    ].join("\n")

};