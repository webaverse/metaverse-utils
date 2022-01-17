varying vec2 texCoord;
uniform float t;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    texCoord = uv;
}
