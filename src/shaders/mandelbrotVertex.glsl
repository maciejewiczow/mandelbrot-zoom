varying vec2 v_fragment_position;

void main() {
    v_fragment_position = position.xy;

    gl_Position = vec4( position, 1.0 );
}