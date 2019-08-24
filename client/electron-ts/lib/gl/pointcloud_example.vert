precision mediump float;
attribute vec4 color;
attribute vec2 depth_texture_index;
uniform float time;
uniform sampler2D depth_texture;
varying float vDepth;
const vec2 u_depth_offset = vec2(310.8018493652344, 234.960693359375);
const vec2 u_depth_focal_length = vec2(640.1978759765625,640.1978759765625);
const float u_depth_scale = 0.0010000000;
const mat4 u_depth_to_color = mat4( 0.9999935626983643,     0.0032274967525154352,   0.0015595328295603395, 0,
                                   -0.0032362034544348717, 0.9999790191650391,       0.005612988956272602, 0, 
                                   -0.0015413842629641294,    -0.005617999937385321,     0.999983012676239, 0, 
                                    0.014842060394585133, -0.00011889140296261758, -0.00009822657011682168, 1.0);
const vec2 u_color_focal_length = vec2(615.8189697265625, 615.447509765625);
const vec2 u_color_offset = vec2(302.6334228515625, 237.02969360351562);
varying vec2 v_color_texture_coord;


vec4 depth_deproject(vec2 index, float depth) {
   vec2 position2d = (index - u_depth_offset) / u_depth_focal_length;
   return vec4(position2d * depth, depth, 1.0);
}

vec2 color_project(vec4 position3d) {
    vec2 position2d = position3d.xy / position3d.z;
    return position2d * u_color_focal_length + u_color_offset;
}

void main(){

    vec2 depth_texture_coord = depth_texture_index / vec2(640, 480);
    vec4 color= texture2D(depth_texture, depth_texture_coord);
    float depth = color.x * 16.0 * 16.0 * 16.0 + color.y * 16.0 * 16.0 + color.z * 16.0 + color.w;
    
    float depth_scaled = u_depth_scale * depth * 10.0;
    vDepth = depth_scaled;
    
    vec4 pos = depth_deproject(depth_texture_index, depth_scaled);
    pos.y *= -1.0;
    pos.x *= -1.0;
    gl_PointSize = 1.0;
    gl_Position = projectionMatrix * modelViewMatrix * pos;
    
    // 3D position of the color pixel.
    pos.x *= -1.0;
    vec4 color_position = u_depth_to_color * pos;
    vec2 color_index = color_project(color_position);
    v_color_texture_coord = color_index / vec2(640, 480);
}