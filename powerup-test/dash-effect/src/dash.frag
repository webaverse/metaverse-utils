uniform sampler2D flameTex;
uniform float t;

varying vec2 texCoord;

void main()
{
    float t = 0.5;

    vec4 texColor = texture(
        flameTex,
        vec2(texCoord.x + 0.1 * sin(10.0 * pow(texCoord.y, 3.0) - t * 10.0), texCoord.y * 0.5));

    gl_FragColor = vec4(vec3(texColor), texColor.b);
}
