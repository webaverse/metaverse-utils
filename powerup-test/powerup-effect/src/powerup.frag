uniform sampler2D flameTex;
uniform float t;
uniform float index;

varying vec2 texCoord;

void main() {
    float t0 = t - index * 0.3;

    float limit;

    if (t0 < 0.3) {
        limit = exp(t0 / 0.3) / exp(1.0);
    } else {
        limit = 1.0 - pow(t0 - 0.3, 2.0);
    }

    if (t0 < 0.0 || limit < 0.1) {
        discard;
    }

    if (texCoord.y < limit) {
        vec4 texColor = texture(flameTex, vec2(texCoord.x * 5.0, texCoord.y + 1.0 - limit));

        gl_FragColor = vec4(vec3(texColor), texColor.b);
    } else {
        discard;
    }
}
