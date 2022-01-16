import { VERTEX_SHADER, FRAGMENT_SHADER, ShaderType, COMPILE_STATUS, LINK_STATUS, TRANSFORM_FEEDBACK } from './type';
import { Vec2 } from '../math/Vec2';
export type GL = WebGLRenderingContext | WebGL2RenderingContext;
export const supportedExtensions = [
    'ANGLE_instanced_arrays',
    'EXT_blend_minmax',
    'EXT_color_buffer_float',
    'EXT_color_buffer_half_float',
    'EXT_disjoint_timer_query',
    'EXT_disjoint_timer_query_webgl2',
    'EXT_frag_depth',
    'EXT_sRGB',
    'EXT_shader_texture_lod',
    'EXT_texture_filter_anisotropic',
    'OES_element_index_uint',
    'OES_standard_derivatives',
    'OES_texture_float',
    'OES_texture_float_linear',
    'OES_texture_half_float',
    'OES_texture_half_float_linear',
    'OES_vertex_array_object',
    'WEBGL_color_buffer_float',
    'WEBGL_compressed_texture_atc',
    'WEBGL_compressed_texture_etc1',
    'WEBGL_compressed_texture_pvrtc',
    'WEBGL_compressed_texture_s3tc',
    'WEBGL_compressed_texture_s3tc_srgb',
    'WEBGL_depth_texture',
    'WEBGL_draw_buffers',
];
export function addExtensionsToContext(gl: WebGLRenderingContext | WebGL2RenderingContext) {
    for (let ii = 0; ii < supportedExtensions.length; ++ii) {
        // addExtensionToContext(gl, supportedExtensions[ii]);
    }
}

export function createContext(canvas: HTMLCanvasElement, opt_attribs: any) {
    const names = ["webgl2", "webgl", "experimental-webgl"];
    let context = null;
    for (let ii = 0; ii < names.length; ++ii) {
        context = canvas.getContext(names[ii], opt_attribs);
        if (context) {
            // if (defaults.addExtensionsToContext) {
            //     addExtensionsToContext(context);
            // }
            break;
        }
    }
    return context;
}

export function createShader(gl: GL, shaderSource: string, type: ShaderType): WebGLShader | null {
    const shader: WebGLShader = gl.createShader(type)!;

    gl.shaderSource(shader, shaderSource);

    // Compile the shader
    gl.compileShader(shader);


    // Check the compile status
    const compiled = gl.getShaderParameter(shader, COMPILE_STATUS);
    if (!compiled) {
        // Something went wrong during compilation; get the error
        const lastError = gl.getShaderInfoLog(shader);

        console.error(lastError)
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

export function createProgram(gl: GL, shaders: {
    vertexShader: string,
    fragmentShader: string
}) {
    const program: WebGLProgram = gl.createProgram()!;

    const vs: WebGLShader | null = createShader(gl, shaders.vertexShader, ShaderType.VERTEX)
    const fs: WebGLShader | null = createShader(gl, shaders.fragmentShader, ShaderType.FRAGMENT)
    gl.attachShader(program, vs!)
    gl.attachShader(program, fs!)

    gl.linkProgram(program);

    // Check the link status
    const linked = gl.getProgramParameter(program, LINK_STATUS);
    if (!linked) {
        // something went wrong with the link
        const lastError = gl.getProgramInfoLog(program);
        console.error(lastError);

        gl.deleteProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        return null;
    }

    return program;
}

function createTransformFeedback(gl: WebGL2RenderingContext) {
    const tf = gl.createTransformFeedback();
    gl.bindTransformFeedback(TRANSFORM_FEEDBACK, tf);
    // gl.useProgram(programInfo.program);
    // bindTransformFeedbackInfo(gl, programInfo, bufferInfo);
    gl.bindTransformFeedback(TRANSFORM_FEEDBACK, null);
    return tf;

}

interface TextureOption {
    id: number;
    uuid: string;
    name: string;
    sourceFile: string;
    image: any; // HTMLImageElement or ImageData or { width: number, height: number } in some children;
    mipmaps: ImageData[];
    mapping: number;
    wrapS: number;
    wrapT: number;
    magFilter: number;
    minFilter: number;
    anisotropy: number;
    format: number;
    type: number;
    offset: Vec2;
    repeat: Vec2;
    center: Vec2;
    rotation: number;
    generateMipmaps: boolean;
    premultiplyAlpha: boolean;
    flipY: boolean;
    unpackAlignment: number;
    encoding: number;
    version: number;
    needsUpdate: boolean;
}

export function createTexture(gl: GL, options: any) {

}
