import "aframe";

/**
 * This string template literal does not modify the input string, but allows us
 * to tag some strings as glsl snippets so that editors (e.g., VSCode) can
 * syntax higlight them.
 */
function glsl(strs) {
  return strs[0];
}

AFRAME.registerShader("hologram", {
  schema: {
    timeMsec: { type: "time", is: "uniform" },
    src: { type: "map", is: "uniform" },

    numScanLines: { type: "int", is: "uniform", default: 150 },
    scanLineDrift: { type: "float", is: "uniform", default: 0.03 },

    saturation: { type: "float", is: "uniform", default: 0.8 },
    alpha: { type: "float", is: "uniform", default: 1.0 },

    glitchOffset: { type: "float", is: "uniform", default: 0.01 },
    numGlitchBars: { type: "int", is: "uniform", default: 6 },
    glitchBarDrift: { type: "float", is: "uniform", default: 0.02 },
    glitchRate: { type: "float", is: "uniform", default: 10 },
    rgbSeparation: { type: "float", is: "uniform", default: 0.03 },
  },

  vertexShader: glsl`
    out vec2 v_uv;
    void main() {
      v_uv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: glsl`
    float PI = 3.14159;

    uniform sampler2D src;
    
    uniform float timeMsec;
    
    uniform float saturation;

    uniform float alpha;
    
    uniform int numScanLines;
    uniform float scanLineDrift;
    
    uniform float glitchOffset;
    uniform int numGlitchBars;
    uniform float glitchBarDrift;
    uniform float glitchRate; 
    uniform float rgbSeparation;

    in vec2 v_uv;

    // --- Color space conversion --- //
    
    vec3 rgb2hsv(vec3 c) {
      vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
      vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
      vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
      float d = q.x - min(q.w, q.y);
      float e = 1.0e-10;
      return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
    }

    vec3 hsv2rgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }

    // --- Random --- //

    float rand(float x) {
      return fract(sin(x) * 43758.0);
    }

    float rand(vec2 x) {
      return rand(dot(x, vec2(12, 48)));
    }

    float rand(vec3 x) {
      return rand(dot(x, vec3(12, 48, 1242)));
    }

    // --- Hologram sampling --- //

    vec2 offset(vec3 seed, vec2 uv, float scale) {
      float shift = (pow(rand(seed), 2.0) - 0.5) * scale;
      return uv + vec2(shift, 0);
    }

    vec4 hologramSample(sampler2D map, vec2 uv) {
      vec4 result;
      vec2 seed = vec2(
        floor((uv.y + timeMsec / 1000.0 * glitchBarDrift) * float(numGlitchBars)),
        floor(timeMsec / 1000.0 * glitchRate)
      );
      vec2 offset_uv = offset(vec3(seed, 0), uv, glitchOffset);
      result.r = texture2D(map, offset(vec3(seed, 1), offset_uv, rgbSeparation)).r;
      result.g = texture2D(map, offset(vec3(seed, 2), offset_uv, rgbSeparation)).g;
      result.b = texture2D(map, offset(vec3(seed, 3), offset_uv, rgbSeparation)).b;
      result.a = texture2D(map, offset(vec3(seed, 4), offset_uv, rgbSeparation)).a;
      return result;
    }

    // --- Main --- //

    void main() {
      vec4 color_rgba = hologramSample(src, v_uv);
      vec3 color_hsv = rgb2hsv(color_rgba.rgb);
      
      color_hsv[2] += sin((v_uv.y + scanLineDrift * timeMsec/1000.0) * PI*2.0 * float(numScanLines)) / 4.0;
      color_hsv[1] *= saturation;

      color_rgba.rgb = hsv2rgb(color_hsv);
      color_rgba.a *= alpha;
      gl_FragColor = color_rgba;
    }
  `,
});
