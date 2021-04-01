(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("aframe"));
	else if(typeof define === 'function' && define.amd)
		define(["aframe"], factory);
	else if(typeof exports === 'object')
		exports["aframeHologramComponent"] = factory(require("aframe"));
	else
		root["aframeHologramComponent"] = factory(root["aframe"]);
})(self, function(__WEBPACK_EXTERNAL_MODULE_aframe__) {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "aframe":
/*!*************************!*\
  !*** external "aframe" ***!
  \*************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_aframe__;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var aframe__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aframe */ "aframe");
/* harmony import */ var aframe__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aframe__WEBPACK_IMPORTED_MODULE_0__);


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

})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hZnJhbWVIb2xvZ3JhbUNvbXBvbmVudC93ZWJwYWNrL3VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24iLCJ3ZWJwYWNrOi8vYWZyYW1lSG9sb2dyYW1Db21wb25lbnQvZXh0ZXJuYWwgXCJhZnJhbWVcIiIsIndlYnBhY2s6Ly9hZnJhbWVIb2xvZ3JhbUNvbXBvbmVudC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9hZnJhbWVIb2xvZ3JhbUNvbXBvbmVudC93ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2s6Ly9hZnJhbWVIb2xvZ3JhbUNvbXBvbmVudC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vYWZyYW1lSG9sb2dyYW1Db21wb25lbnQvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9hZnJhbWVIb2xvZ3JhbUNvbXBvbmVudC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2FmcmFtZUhvbG9ncmFtQ29tcG9uZW50Ly4vc3JjL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxPOzs7Ozs7Ozs7O0FDVkEsb0Q7Ozs7OztVQ0FBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxnQ0FBZ0MsWUFBWTtXQUM1QztXQUNBLEU7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx3Q0FBd0MseUNBQXlDO1dBQ2pGO1dBQ0E7V0FDQSxFOzs7OztXQ1BBLHdGOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHNEQUFzRCxrQkFBa0I7V0FDeEU7V0FDQSwrQ0FBK0MsY0FBYztXQUM3RCxFOzs7Ozs7Ozs7Ozs7O0FDTmdCOztBQUVoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxlQUFlLDhCQUE4QjtBQUM3QyxVQUFVLDZCQUE2Qjs7QUFFdkMsbUJBQW1CLDJDQUEyQztBQUM5RCxvQkFBb0IsOENBQThDOztBQUVsRSxpQkFBaUIsNkNBQTZDO0FBQzlELFlBQVksNkNBQTZDOztBQUV6RCxtQkFBbUIsOENBQThDO0FBQ2pFLG9CQUFvQix5Q0FBeUM7QUFDN0QscUJBQXFCLDhDQUE4QztBQUNuRSxpQkFBaUIsNENBQTRDO0FBQzdELG9CQUFvQiw4Q0FBOEM7QUFDbEUsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsNkI7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkocmVxdWlyZShcImFmcmFtZVwiKSk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShbXCJhZnJhbWVcIl0sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wiYWZyYW1lSG9sb2dyYW1Db21wb25lbnRcIl0gPSBmYWN0b3J5KHJlcXVpcmUoXCJhZnJhbWVcIikpO1xuXHRlbHNlXG5cdFx0cm9vdFtcImFmcmFtZUhvbG9ncmFtQ29tcG9uZW50XCJdID0gZmFjdG9yeShyb290W1wiYWZyYW1lXCJdKTtcbn0pKHNlbGYsIGZ1bmN0aW9uKF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfYWZyYW1lX18pIHtcbnJldHVybiAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfYWZyYW1lX187IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCBcImFmcmFtZVwiO1xuXG4vKipcbiAqIFRoaXMgc3RyaW5nIHRlbXBsYXRlIGxpdGVyYWwgZG9lcyBub3QgbW9kaWZ5IHRoZSBpbnB1dCBzdHJpbmcsIGJ1dCBhbGxvd3MgdXNcbiAqIHRvIHRhZyBzb21lIHN0cmluZ3MgYXMgZ2xzbCBzbmlwcGV0cyBzbyB0aGF0IGVkaXRvcnMgKGUuZy4sIFZTQ29kZSkgY2FuXG4gKiBzeW50YXggaGlnbGlnaHQgdGhlbS5cbiAqL1xuZnVuY3Rpb24gZ2xzbChzdHJzKSB7XG4gIHJldHVybiBzdHJzWzBdO1xufVxuXG5BRlJBTUUucmVnaXN0ZXJTaGFkZXIoXCJob2xvZ3JhbVwiLCB7XG4gIHNjaGVtYToge1xuICAgIHRpbWVNc2VjOiB7IHR5cGU6IFwidGltZVwiLCBpczogXCJ1bmlmb3JtXCIgfSxcbiAgICBzcmM6IHsgdHlwZTogXCJtYXBcIiwgaXM6IFwidW5pZm9ybVwiIH0sXG5cbiAgICBudW1TY2FuTGluZXM6IHsgdHlwZTogXCJpbnRcIiwgaXM6IFwidW5pZm9ybVwiLCBkZWZhdWx0OiAxNTAgfSxcbiAgICBzY2FuTGluZURyaWZ0OiB7IHR5cGU6IFwiZmxvYXRcIiwgaXM6IFwidW5pZm9ybVwiLCBkZWZhdWx0OiAwLjAzIH0sXG5cbiAgICBzYXR1cmF0aW9uOiB7IHR5cGU6IFwiZmxvYXRcIiwgaXM6IFwidW5pZm9ybVwiLCBkZWZhdWx0OiAwLjggfSxcbiAgICBhbHBoYTogeyB0eXBlOiBcImZsb2F0XCIsIGlzOiBcInVuaWZvcm1cIiwgZGVmYXVsdDogMS4wIH0sXG5cbiAgICBnbGl0Y2hPZmZzZXQ6IHsgdHlwZTogXCJmbG9hdFwiLCBpczogXCJ1bmlmb3JtXCIsIGRlZmF1bHQ6IDAuMDEgfSxcbiAgICBudW1HbGl0Y2hCYXJzOiB7IHR5cGU6IFwiaW50XCIsIGlzOiBcInVuaWZvcm1cIiwgZGVmYXVsdDogNiB9LFxuICAgIGdsaXRjaEJhckRyaWZ0OiB7IHR5cGU6IFwiZmxvYXRcIiwgaXM6IFwidW5pZm9ybVwiLCBkZWZhdWx0OiAwLjAyIH0sXG4gICAgZ2xpdGNoUmF0ZTogeyB0eXBlOiBcImZsb2F0XCIsIGlzOiBcInVuaWZvcm1cIiwgZGVmYXVsdDogMTAgfSxcbiAgICByZ2JTZXBhcmF0aW9uOiB7IHR5cGU6IFwiZmxvYXRcIiwgaXM6IFwidW5pZm9ybVwiLCBkZWZhdWx0OiAwLjAzIH0sXG4gIH0sXG5cbiAgdmVydGV4U2hhZGVyOiBnbHNsYFxuICAgIG91dCB2ZWMyIHZfdXY7XG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgdl91diA9IHV2O1xuICAgICAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0aW9uTWF0cml4ICogbW9kZWxWaWV3TWF0cml4ICogdmVjNChwb3NpdGlvbiwgMS4wKTtcbiAgICB9XG4gIGAsXG5cbiAgZnJhZ21lbnRTaGFkZXI6IGdsc2xgXG4gICAgZmxvYXQgUEkgPSAzLjE0MTU5O1xuXG4gICAgdW5pZm9ybSBzYW1wbGVyMkQgc3JjO1xuICAgIFxuICAgIHVuaWZvcm0gZmxvYXQgdGltZU1zZWM7XG4gICAgXG4gICAgdW5pZm9ybSBmbG9hdCBzYXR1cmF0aW9uO1xuXG4gICAgdW5pZm9ybSBmbG9hdCBhbHBoYTtcbiAgICBcbiAgICB1bmlmb3JtIGludCBudW1TY2FuTGluZXM7XG4gICAgdW5pZm9ybSBmbG9hdCBzY2FuTGluZURyaWZ0O1xuICAgIFxuICAgIHVuaWZvcm0gZmxvYXQgZ2xpdGNoT2Zmc2V0O1xuICAgIHVuaWZvcm0gaW50IG51bUdsaXRjaEJhcnM7XG4gICAgdW5pZm9ybSBmbG9hdCBnbGl0Y2hCYXJEcmlmdDtcbiAgICB1bmlmb3JtIGZsb2F0IGdsaXRjaFJhdGU7IFxuICAgIHVuaWZvcm0gZmxvYXQgcmdiU2VwYXJhdGlvbjtcblxuICAgIGluIHZlYzIgdl91djtcblxuICAgIC8vIC0tLSBDb2xvciBzcGFjZSBjb252ZXJzaW9uIC0tLSAvL1xuICAgIFxuICAgIHZlYzMgcmdiMmhzdih2ZWMzIGMpIHtcbiAgICAgIHZlYzQgSyA9IHZlYzQoMC4wLCAtMS4wIC8gMy4wLCAyLjAgLyAzLjAsIC0xLjApO1xuICAgICAgdmVjNCBwID0gbWl4KHZlYzQoYy5iZywgSy53eiksIHZlYzQoYy5nYiwgSy54eSksIHN0ZXAoYy5iLCBjLmcpKTtcbiAgICAgIHZlYzQgcSA9IG1peCh2ZWM0KHAueHl3LCBjLnIpLCB2ZWM0KGMuciwgcC55engpLCBzdGVwKHAueCwgYy5yKSk7XG4gICAgICBmbG9hdCBkID0gcS54IC0gbWluKHEudywgcS55KTtcbiAgICAgIGZsb2F0IGUgPSAxLjBlLTEwO1xuICAgICAgcmV0dXJuIHZlYzMoYWJzKHEueiArIChxLncgLSBxLnkpIC8gKDYuMCAqIGQgKyBlKSksIGQgLyAocS54ICsgZSksIHEueCk7XG4gICAgfVxuXG4gICAgdmVjMyBoc3YycmdiKHZlYzMgYykge1xuICAgICAgdmVjNCBLID0gdmVjNCgxLjAsIDIuMCAvIDMuMCwgMS4wIC8gMy4wLCAzLjApO1xuICAgICAgdmVjMyBwID0gYWJzKGZyYWN0KGMueHh4ICsgSy54eXopICogNi4wIC0gSy53d3cpO1xuICAgICAgcmV0dXJuIGMueiAqIG1peChLLnh4eCwgY2xhbXAocCAtIEsueHh4LCAwLjAsIDEuMCksIGMueSk7XG4gICAgfVxuXG4gICAgLy8gLS0tIFJhbmRvbSAtLS0gLy9cblxuICAgIGZsb2F0IHJhbmQoZmxvYXQgeCkge1xuICAgICAgcmV0dXJuIGZyYWN0KHNpbih4KSAqIDQzNzU4LjApO1xuICAgIH1cblxuICAgIGZsb2F0IHJhbmQodmVjMiB4KSB7XG4gICAgICByZXR1cm4gcmFuZChkb3QoeCwgdmVjMigxMiwgNDgpKSk7XG4gICAgfVxuXG4gICAgZmxvYXQgcmFuZCh2ZWMzIHgpIHtcbiAgICAgIHJldHVybiByYW5kKGRvdCh4LCB2ZWMzKDEyLCA0OCwgMTI0MikpKTtcbiAgICB9XG5cbiAgICAvLyAtLS0gSG9sb2dyYW0gc2FtcGxpbmcgLS0tIC8vXG5cbiAgICB2ZWMyIG9mZnNldCh2ZWMzIHNlZWQsIHZlYzIgdXYsIGZsb2F0IHNjYWxlKSB7XG4gICAgICBmbG9hdCBzaGlmdCA9IChwb3cocmFuZChzZWVkKSwgMi4wKSAtIDAuNSkgKiBzY2FsZTtcbiAgICAgIHJldHVybiB1diArIHZlYzIoc2hpZnQsIDApO1xuICAgIH1cblxuICAgIHZlYzQgaG9sb2dyYW1TYW1wbGUoc2FtcGxlcjJEIG1hcCwgdmVjMiB1dikge1xuICAgICAgdmVjNCByZXN1bHQ7XG4gICAgICB2ZWMyIHNlZWQgPSB2ZWMyKFxuICAgICAgICBmbG9vcigodXYueSArIHRpbWVNc2VjIC8gMTAwMC4wICogZ2xpdGNoQmFyRHJpZnQpICogZmxvYXQobnVtR2xpdGNoQmFycykpLFxuICAgICAgICBmbG9vcih0aW1lTXNlYyAvIDEwMDAuMCAqIGdsaXRjaFJhdGUpXG4gICAgICApO1xuICAgICAgdmVjMiBvZmZzZXRfdXYgPSBvZmZzZXQodmVjMyhzZWVkLCAwKSwgdXYsIGdsaXRjaE9mZnNldCk7XG4gICAgICByZXN1bHQuciA9IHRleHR1cmUyRChtYXAsIG9mZnNldCh2ZWMzKHNlZWQsIDEpLCBvZmZzZXRfdXYsIHJnYlNlcGFyYXRpb24pKS5yO1xuICAgICAgcmVzdWx0LmcgPSB0ZXh0dXJlMkQobWFwLCBvZmZzZXQodmVjMyhzZWVkLCAyKSwgb2Zmc2V0X3V2LCByZ2JTZXBhcmF0aW9uKSkuZztcbiAgICAgIHJlc3VsdC5iID0gdGV4dHVyZTJEKG1hcCwgb2Zmc2V0KHZlYzMoc2VlZCwgMyksIG9mZnNldF91diwgcmdiU2VwYXJhdGlvbikpLmI7XG4gICAgICByZXN1bHQuYSA9IHRleHR1cmUyRChtYXAsIG9mZnNldCh2ZWMzKHNlZWQsIDQpLCBvZmZzZXRfdXYsIHJnYlNlcGFyYXRpb24pKS5hO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvLyAtLS0gTWFpbiAtLS0gLy9cblxuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgIHZlYzQgY29sb3JfcmdiYSA9IGhvbG9ncmFtU2FtcGxlKHNyYywgdl91dik7XG4gICAgICB2ZWMzIGNvbG9yX2hzdiA9IHJnYjJoc3YoY29sb3JfcmdiYS5yZ2IpO1xuICAgICAgXG4gICAgICBjb2xvcl9oc3ZbMl0gKz0gc2luKCh2X3V2LnkgKyBzY2FuTGluZURyaWZ0ICogdGltZU1zZWMvMTAwMC4wKSAqIFBJKjIuMCAqIGZsb2F0KG51bVNjYW5MaW5lcykpIC8gNC4wO1xuICAgICAgY29sb3JfaHN2WzFdICo9IHNhdHVyYXRpb247XG5cbiAgICAgIGNvbG9yX3JnYmEucmdiID0gaHN2MnJnYihjb2xvcl9oc3YpO1xuICAgICAgY29sb3JfcmdiYS5hICo9IGFscGhhO1xuICAgICAgZ2xfRnJhZ0NvbG9yID0gY29sb3JfcmdiYTtcbiAgICB9XG4gIGAsXG59KTtcbiJdLCJzb3VyY2VSb290IjoiIn0=