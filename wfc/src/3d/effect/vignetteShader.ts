
/**
 * Vignette shader
 * based on PaintEffect postprocess from ro.me
 * http://code.google.com/p/3-dreams-of-black/source/browse/deploy/js/effects/PaintEffect.js
 */

export const VignetteShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"offset": { value: 1.0 },
		"darkness": { value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

		"	vUv = uv;",
		"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [
		"precision highp float;",

		"uniform float offset;",
		"uniform float darkness;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

		// Eskil's vignette

		"	vec4 texel = texture2D( tDiffuse, vUv );",
		"	vec2 uv = abs( vUv - vec2( 0.5 ));",
		` 	float len = length(uv);
			len -= 0.25;
			len = clamp(len,0.0,1.0);
			len *= 2.5;
		`,
		"	uv.x = clamp(uv.x,0.0,1.0);",
		"	uv.y = clamp(uv.y,0.0,1.0);",
		"	gl_FragColor = vec4( mix( texel.rgb, vec3(0.0), len*len), texel.a );",

		/*
		// alternative version from glfx.js
		// this one makes more "dusty" look (as opposed to "burned")

		"	vec4 color = texture2D( tDiffuse, vUv );",
		"	float dist = distance( vUv, vec2( 0.5 ) );",
		"	color.rgb *= smoothstep( 0.8, offset * 0.799, dist *( darkness + offset ) );",
		"	gl_FragColor = color;",
		*/

		"}"

	].join("\n")

}; 
