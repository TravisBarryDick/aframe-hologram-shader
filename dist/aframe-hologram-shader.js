!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.aframeHologramShader=t():e.aframeHologramShader=t()}(self,(function(){return(()=>{function e(e){return e[0]}return AFRAME.registerShader("hologram",{schema:{timeMsec:{type:"time",is:"uniform"},src:{type:"map",is:"uniform"},numScanLines:{type:"int",is:"uniform",default:150},scanLineDrift:{type:"float",is:"uniform",default:.03},saturation:{type:"float",is:"uniform",default:.8},alpha:{type:"float",is:"uniform",default:1},glitchOffset:{type:"float",is:"uniform",default:.01},numGlitchBars:{type:"int",is:"uniform",default:6},glitchBarDrift:{type:"float",is:"uniform",default:.02},glitchRate:{type:"float",is:"uniform",default:10},rgbSeparation:{type:"float",is:"uniform",default:.03}},vertexShader:e`
    out vec2 v_uv;
    void main() {
      v_uv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,fragmentShader:e`
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
  `}),{}})()}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hZnJhbWVIb2xvZ3JhbVNoYWRlci93ZWJwYWNrL3VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24iLCJ3ZWJwYWNrOi8vYWZyYW1lSG9sb2dyYW1TaGFkZXIvLi9zcmMvaW5kZXguanMiXSwibmFtZXMiOlsicm9vdCIsImZhY3RvcnkiLCJleHBvcnRzIiwibW9kdWxlIiwiZGVmaW5lIiwiYW1kIiwic2VsZiIsImdsc2wiLCJzdHJzIiwiQUZSQU1FIiwicmVnaXN0ZXJTaGFkZXIiLCJzY2hlbWEiLCJ0aW1lTXNlYyIsInR5cGUiLCJpcyIsInNyYyIsIm51bVNjYW5MaW5lcyIsImRlZmF1bHQiLCJzY2FuTGluZURyaWZ0Iiwic2F0dXJhdGlvbiIsImFscGhhIiwiZ2xpdGNoT2Zmc2V0IiwibnVtR2xpdGNoQmFycyIsImdsaXRjaEJhckRyaWZ0IiwiZ2xpdGNoUmF0ZSIsInJnYlNlcGFyYXRpb24iLCJ2ZXJ0ZXhTaGFkZXIiLCJmcmFnbWVudFNoYWRlciJdLCJtYXBwaW5ncyI6IkNBQUEsU0FBMkNBLEVBQU1DLEdBQzFCLGlCQUFaQyxTQUEwQyxpQkFBWEMsT0FDeENBLE9BQU9ELFFBQVVELElBQ1EsbUJBQVhHLFFBQXlCQSxPQUFPQyxJQUM5Q0QsT0FBTyxHQUFJSCxHQUNlLGlCQUFaQyxRQUNkQSxRQUE4QixxQkFBSUQsSUFFbENELEVBQTJCLHFCQUFJQyxJQVJqQyxDQVNHSyxNQUFNLFdBQ1QsTSxNQ0xBLFNBQVNDLEVBQUtDLEdBQ1osT0FBT0EsRUFBSyxHLE9BR2RDLE9BQU9DLGVBQWUsV0FBWSxDQUNoQ0MsT0FBUSxDQUNOQyxTQUFVLENBQUVDLEtBQU0sT0FBUUMsR0FBSSxXQUM5QkMsSUFBSyxDQUFFRixLQUFNLE1BQU9DLEdBQUksV0FFeEJFLGFBQWMsQ0FBRUgsS0FBTSxNQUFPQyxHQUFJLFVBQVdHLFFBQVMsS0FDckRDLGNBQWUsQ0FBRUwsS0FBTSxRQUFTQyxHQUFJLFVBQVdHLFFBQVMsS0FFeERFLFdBQVksQ0FBRU4sS0FBTSxRQUFTQyxHQUFJLFVBQVdHLFFBQVMsSUFDckRHLE1BQU8sQ0FBRVAsS0FBTSxRQUFTQyxHQUFJLFVBQVdHLFFBQVMsR0FFaERJLGFBQWMsQ0FBRVIsS0FBTSxRQUFTQyxHQUFJLFVBQVdHLFFBQVMsS0FDdkRLLGNBQWUsQ0FBRVQsS0FBTSxNQUFPQyxHQUFJLFVBQVdHLFFBQVMsR0FDdERNLGVBQWdCLENBQUVWLEtBQU0sUUFBU0MsR0FBSSxVQUFXRyxRQUFTLEtBQ3pETyxXQUFZLENBQUVYLEtBQU0sUUFBU0MsR0FBSSxVQUFXRyxRQUFTLElBQ3JEUSxjQUFlLENBQUVaLEtBQU0sUUFBU0MsR0FBSSxVQUFXRyxRQUFTLE1BRzFEUyxhQUFjbkIsQ0FBSTs7Ozs7O0lBUWxCb0IsZUFBZ0JwQixDQUFJIiwiZmlsZSI6ImFmcmFtZS1ob2xvZ3JhbS1zaGFkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShbXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJhZnJhbWVIb2xvZ3JhbVNoYWRlclwiXSA9IGZhY3RvcnkoKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJhZnJhbWVIb2xvZ3JhbVNoYWRlclwiXSA9IGZhY3RvcnkoKTtcbn0pKHNlbGYsIGZ1bmN0aW9uKCkge1xucmV0dXJuICIsIi8qKlxuICogVGhpcyBzdHJpbmcgdGVtcGxhdGUgbGl0ZXJhbCBkb2VzIG5vdCBtb2RpZnkgdGhlIGlucHV0IHN0cmluZywgYnV0IGFsbG93cyB1c1xuICogdG8gdGFnIHNvbWUgc3RyaW5ncyBhcyBnbHNsIHNuaXBwZXRzIHNvIHRoYXQgZWRpdG9ycyAoZS5nLiwgVlNDb2RlKSBjYW5cbiAqIHN5bnRheCBoaWdsaWdodCB0aGVtLlxuICovXG5mdW5jdGlvbiBnbHNsKHN0cnMpIHtcbiAgcmV0dXJuIHN0cnNbMF07XG59XG5cbkFGUkFNRS5yZWdpc3RlclNoYWRlcihcImhvbG9ncmFtXCIsIHtcbiAgc2NoZW1hOiB7XG4gICAgdGltZU1zZWM6IHsgdHlwZTogXCJ0aW1lXCIsIGlzOiBcInVuaWZvcm1cIiB9LFxuICAgIHNyYzogeyB0eXBlOiBcIm1hcFwiLCBpczogXCJ1bmlmb3JtXCIgfSxcblxuICAgIG51bVNjYW5MaW5lczogeyB0eXBlOiBcImludFwiLCBpczogXCJ1bmlmb3JtXCIsIGRlZmF1bHQ6IDE1MCB9LFxuICAgIHNjYW5MaW5lRHJpZnQ6IHsgdHlwZTogXCJmbG9hdFwiLCBpczogXCJ1bmlmb3JtXCIsIGRlZmF1bHQ6IDAuMDMgfSxcblxuICAgIHNhdHVyYXRpb246IHsgdHlwZTogXCJmbG9hdFwiLCBpczogXCJ1bmlmb3JtXCIsIGRlZmF1bHQ6IDAuOCB9LFxuICAgIGFscGhhOiB7IHR5cGU6IFwiZmxvYXRcIiwgaXM6IFwidW5pZm9ybVwiLCBkZWZhdWx0OiAxLjAgfSxcblxuICAgIGdsaXRjaE9mZnNldDogeyB0eXBlOiBcImZsb2F0XCIsIGlzOiBcInVuaWZvcm1cIiwgZGVmYXVsdDogMC4wMSB9LFxuICAgIG51bUdsaXRjaEJhcnM6IHsgdHlwZTogXCJpbnRcIiwgaXM6IFwidW5pZm9ybVwiLCBkZWZhdWx0OiA2IH0sXG4gICAgZ2xpdGNoQmFyRHJpZnQ6IHsgdHlwZTogXCJmbG9hdFwiLCBpczogXCJ1bmlmb3JtXCIsIGRlZmF1bHQ6IDAuMDIgfSxcbiAgICBnbGl0Y2hSYXRlOiB7IHR5cGU6IFwiZmxvYXRcIiwgaXM6IFwidW5pZm9ybVwiLCBkZWZhdWx0OiAxMCB9LFxuICAgIHJnYlNlcGFyYXRpb246IHsgdHlwZTogXCJmbG9hdFwiLCBpczogXCJ1bmlmb3JtXCIsIGRlZmF1bHQ6IDAuMDMgfSxcbiAgfSxcblxuICB2ZXJ0ZXhTaGFkZXI6IGdsc2xgXG4gICAgb3V0IHZlYzIgdl91djtcbiAgICB2b2lkIG1haW4oKSB7XG4gICAgICB2X3V2ID0gdXY7XG4gICAgICBnbF9Qb3NpdGlvbiA9IHByb2plY3Rpb25NYXRyaXggKiBtb2RlbFZpZXdNYXRyaXggKiB2ZWM0KHBvc2l0aW9uLCAxLjApO1xuICAgIH1cbiAgYCxcblxuICBmcmFnbWVudFNoYWRlcjogZ2xzbGBcbiAgICBmbG9hdCBQSSA9IDMuMTQxNTk7XG5cbiAgICB1bmlmb3JtIHNhbXBsZXIyRCBzcmM7XG4gICAgXG4gICAgdW5pZm9ybSBmbG9hdCB0aW1lTXNlYztcbiAgICBcbiAgICB1bmlmb3JtIGZsb2F0IHNhdHVyYXRpb247XG5cbiAgICB1bmlmb3JtIGZsb2F0IGFscGhhO1xuICAgIFxuICAgIHVuaWZvcm0gaW50IG51bVNjYW5MaW5lcztcbiAgICB1bmlmb3JtIGZsb2F0IHNjYW5MaW5lRHJpZnQ7XG4gICAgXG4gICAgdW5pZm9ybSBmbG9hdCBnbGl0Y2hPZmZzZXQ7XG4gICAgdW5pZm9ybSBpbnQgbnVtR2xpdGNoQmFycztcbiAgICB1bmlmb3JtIGZsb2F0IGdsaXRjaEJhckRyaWZ0O1xuICAgIHVuaWZvcm0gZmxvYXQgZ2xpdGNoUmF0ZTsgXG4gICAgdW5pZm9ybSBmbG9hdCByZ2JTZXBhcmF0aW9uO1xuXG4gICAgaW4gdmVjMiB2X3V2O1xuXG4gICAgLy8gLS0tIENvbG9yIHNwYWNlIGNvbnZlcnNpb24gLS0tIC8vXG4gICAgXG4gICAgdmVjMyByZ2IyaHN2KHZlYzMgYykge1xuICAgICAgdmVjNCBLID0gdmVjNCgwLjAsIC0xLjAgLyAzLjAsIDIuMCAvIDMuMCwgLTEuMCk7XG4gICAgICB2ZWM0IHAgPSBtaXgodmVjNChjLmJnLCBLLnd6KSwgdmVjNChjLmdiLCBLLnh5KSwgc3RlcChjLmIsIGMuZykpO1xuICAgICAgdmVjNCBxID0gbWl4KHZlYzQocC54eXcsIGMuciksIHZlYzQoYy5yLCBwLnl6eCksIHN0ZXAocC54LCBjLnIpKTtcbiAgICAgIGZsb2F0IGQgPSBxLnggLSBtaW4ocS53LCBxLnkpO1xuICAgICAgZmxvYXQgZSA9IDEuMGUtMTA7XG4gICAgICByZXR1cm4gdmVjMyhhYnMocS56ICsgKHEudyAtIHEueSkgLyAoNi4wICogZCArIGUpKSwgZCAvIChxLnggKyBlKSwgcS54KTtcbiAgICB9XG5cbiAgICB2ZWMzIGhzdjJyZ2IodmVjMyBjKSB7XG4gICAgICB2ZWM0IEsgPSB2ZWM0KDEuMCwgMi4wIC8gMy4wLCAxLjAgLyAzLjAsIDMuMCk7XG4gICAgICB2ZWMzIHAgPSBhYnMoZnJhY3QoYy54eHggKyBLLnh5eikgKiA2LjAgLSBLLnd3dyk7XG4gICAgICByZXR1cm4gYy56ICogbWl4KEsueHh4LCBjbGFtcChwIC0gSy54eHgsIDAuMCwgMS4wKSwgYy55KTtcbiAgICB9XG5cbiAgICAvLyAtLS0gUmFuZG9tIC0tLSAvL1xuXG4gICAgZmxvYXQgcmFuZChmbG9hdCB4KSB7XG4gICAgICByZXR1cm4gZnJhY3Qoc2luKHgpICogNDM3NTguMCk7XG4gICAgfVxuXG4gICAgZmxvYXQgcmFuZCh2ZWMyIHgpIHtcbiAgICAgIHJldHVybiByYW5kKGRvdCh4LCB2ZWMyKDEyLCA0OCkpKTtcbiAgICB9XG5cbiAgICBmbG9hdCByYW5kKHZlYzMgeCkge1xuICAgICAgcmV0dXJuIHJhbmQoZG90KHgsIHZlYzMoMTIsIDQ4LCAxMjQyKSkpO1xuICAgIH1cblxuICAgIC8vIC0tLSBIb2xvZ3JhbSBzYW1wbGluZyAtLS0gLy9cblxuICAgIHZlYzIgb2Zmc2V0KHZlYzMgc2VlZCwgdmVjMiB1diwgZmxvYXQgc2NhbGUpIHtcbiAgICAgIGZsb2F0IHNoaWZ0ID0gKHBvdyhyYW5kKHNlZWQpLCAyLjApIC0gMC41KSAqIHNjYWxlO1xuICAgICAgcmV0dXJuIHV2ICsgdmVjMihzaGlmdCwgMCk7XG4gICAgfVxuXG4gICAgdmVjNCBob2xvZ3JhbVNhbXBsZShzYW1wbGVyMkQgbWFwLCB2ZWMyIHV2KSB7XG4gICAgICB2ZWM0IHJlc3VsdDtcbiAgICAgIHZlYzIgc2VlZCA9IHZlYzIoXG4gICAgICAgIGZsb29yKCh1di55ICsgdGltZU1zZWMgLyAxMDAwLjAgKiBnbGl0Y2hCYXJEcmlmdCkgKiBmbG9hdChudW1HbGl0Y2hCYXJzKSksXG4gICAgICAgIGZsb29yKHRpbWVNc2VjIC8gMTAwMC4wICogZ2xpdGNoUmF0ZSlcbiAgICAgICk7XG4gICAgICB2ZWMyIG9mZnNldF91diA9IG9mZnNldCh2ZWMzKHNlZWQsIDApLCB1diwgZ2xpdGNoT2Zmc2V0KTtcbiAgICAgIHJlc3VsdC5yID0gdGV4dHVyZTJEKG1hcCwgb2Zmc2V0KHZlYzMoc2VlZCwgMSksIG9mZnNldF91diwgcmdiU2VwYXJhdGlvbikpLnI7XG4gICAgICByZXN1bHQuZyA9IHRleHR1cmUyRChtYXAsIG9mZnNldCh2ZWMzKHNlZWQsIDIpLCBvZmZzZXRfdXYsIHJnYlNlcGFyYXRpb24pKS5nO1xuICAgICAgcmVzdWx0LmIgPSB0ZXh0dXJlMkQobWFwLCBvZmZzZXQodmVjMyhzZWVkLCAzKSwgb2Zmc2V0X3V2LCByZ2JTZXBhcmF0aW9uKSkuYjtcbiAgICAgIHJlc3VsdC5hID0gdGV4dHVyZTJEKG1hcCwgb2Zmc2V0KHZlYzMoc2VlZCwgNCksIG9mZnNldF91diwgcmdiU2VwYXJhdGlvbikpLmE7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8vIC0tLSBNYWluIC0tLSAvL1xuXG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgdmVjNCBjb2xvcl9yZ2JhID0gaG9sb2dyYW1TYW1wbGUoc3JjLCB2X3V2KTtcbiAgICAgIHZlYzMgY29sb3JfaHN2ID0gcmdiMmhzdihjb2xvcl9yZ2JhLnJnYik7XG4gICAgICBcbiAgICAgIGNvbG9yX2hzdlsyXSArPSBzaW4oKHZfdXYueSArIHNjYW5MaW5lRHJpZnQgKiB0aW1lTXNlYy8xMDAwLjApICogUEkqMi4wICogZmxvYXQobnVtU2NhbkxpbmVzKSkgLyA0LjA7XG4gICAgICBjb2xvcl9oc3ZbMV0gKj0gc2F0dXJhdGlvbjtcblxuICAgICAgY29sb3JfcmdiYS5yZ2IgPSBoc3YycmdiKGNvbG9yX2hzdik7XG4gICAgICBjb2xvcl9yZ2JhLmEgKj0gYWxwaGE7XG4gICAgICBnbF9GcmFnQ29sb3IgPSBjb2xvcl9yZ2JhO1xuICAgIH1cbiAgYCxcbn0pO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==