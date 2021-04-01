# A-Frame Hologram Shader

<p align="center">
  <img src="example.gif" style="border-style: solid; border-color: gray"/>
  
  <a href="https://travisbarrydick.github.io/aframe-hologram-shader/dist/index.html"> Interactive Demo </a>
</p>

## Description of Effect

This shader corrupts an image or video texture to make it look like a hologram. There are three main effects applied:

1. The texture can be made transparent and desaturated.
1. Scan lines (dark horizontal lines) are drawn on the image. These scanlines slowly drift down the hologram.
1. Glitch effect: The texture is broken up vertically into equal-height "glitch bars". Each glitch bar is randomly shifted horizontally to create a jittering effect. After the horizontal shift, each of the RGBA components of the glitch bar are further randomly shifted to create a "glitch" effect. The boundaries between glitch bars slowly drift down the hologram.

This component was developed in partnership with Planet Voodoo&reg; (Voodoo LLC) as part of their 'WebXR Wizardry' initiative.

## Configurable Parameters

The following parameters can be used to customize the effect. You can play with their values in the <a href="https://travisbarrydick.github.io/aframe-hologram-shader/dist/index.html">interactive demo</a>.

| Parameter      | Type  | Description                                                                                                                                                                         |
| -------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| src            | map   | Texture to display on the hologram. Can be an image or video.                                                                                                                       |
| numScanLines   | int   | The number of scan lines to draw on the texture.                                                                                                                                    |
| scanLineDrift  | float | The speed that the scanlines move down the texture. Should be a number in `[0,1]` which is the fraction of the hologram each scanline moves per second                              |
| saturation     | float | The saturation of each fragment in the HSV color space is scaled by this value. A value of `0` makes the hologram grayscale, while a value of `1` leaves the saturation unmodified. |
| alpha          | float | The alpha value of each fragment is multiplied by this parameter. Values of `0` and `1` result in completely transparent and opaque holograms, respectively.                        |
| numGlitchBars  | int   | The number of glitch bars to use in the effect.                                                                                                                                     |
| glitchOffset   | float | Maximum horizontal offset for each glitch bar. Should be a number in `[0,1]`, which is the maximum fraction of the holgoram width that each glitch bar can move.                    |
| glitchBarDrift | float | Similar to the scan line drift, except it causes the boundaries of the glitch bars to move.                                                                                         |
| rgbSeparation  | float | Similar to glitchOffset, except this is the maximum shift for each of the RGBA components.                                                                                          |
| glitchRate     | float | How many times per second to update the glitch effect.                                                                                                                              |
