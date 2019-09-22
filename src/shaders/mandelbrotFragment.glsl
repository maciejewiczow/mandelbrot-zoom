uniform float scale;
uniform vec2 translation;
uniform float aspectRatio;
uniform float time;

varying vec2 v_fragment_position;

const float PI = 3.1415926535897932384626433832795;

float map(float x, float min_s, float max_s, float min_d, float max_d) {
    return ((x - min_s)/(max_s - min_s))*(max_d - min_d);
}

void main() {
    vec2 c, z;

    c = (1.0/scale) * v_fragment_position + translation;
    c.y /= aspectRatio;
    c.x -= 0.25;

    z = vec2(0.0, 0.0);

    int iterations = 0;

    for(int i = 0; i < ITERATION_LIMIT; i++) {
        iterations = i;
        if ((z.x*z.x + z.y*z.y) > 4.0) break;

        float x = (z.x*z.x - z.y*z.y) + c.x;
        float y = (2.0*z.x*z.y) + c.y;

        z.x = x;
        z.y = y;
    }

    float value = (iterations != ITERATION_LIMIT-1) ? sqrt(float(iterations)/float(ITERATION_LIMIT)) : 0.0;

    gl_FragColor = vec4(abs(value*sin(time)), abs(value*sin(2.0*PI/3.0 + time)), abs(value*sin(4.0*PI/3.0 + time)), 1.0);
}