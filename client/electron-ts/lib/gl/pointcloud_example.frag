precision mediump float;
uniform float time;
varying vec2 v_color_texture_coord;
uniform sampler2D color_texture;

void main(){
    // float t = time * 0.001;
    if    (v_color_texture_coord.x <= 1.0
            && v_color_texture_coord.x >= 0.0
            && v_color_texture_coord.y <= 1.0
            && v_color_texture_coord.y >= 0.0) {
                gl_FragColor = texture2D(color_texture, v_color_texture_coord);
    } else {
                gl_FragColor = vec4(1.0, 0, 0, 1.0);
    }
    // gl_FragColor = vec4(1.0, 0, 0, 1.0);
}