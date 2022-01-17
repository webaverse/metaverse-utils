varying vec2 texCoord;
uniform float t;
uniform float index;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(
        position.x * (1.0 + t * 2.0 - index * 2.0 * 0.4),
        position.y,
        position.z * (1.0 + t * 2.0 - index * 2.0 * 0.4) , 1.0
    );
    texCoord = uv;
}
