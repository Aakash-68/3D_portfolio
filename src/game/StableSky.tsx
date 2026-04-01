import * as THREE from "three";
import { useMemo } from "react";
import { useThree } from "@react-three/fiber";

export default function StableSky() {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      depthWrite: false,
      depthTest: false,
      uniforms: {
        topColor: { value: new THREE.Color("#b0cdef") }, // Light sky
        bottomColor: { value: new THREE.Color("#c9f3ff") }, // Darker lower band
        split: { value: 0.99 }, // 75% light area
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          // Fullscreen quad in clip space
          gl_Position = vec4(position.xy , 0.5, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float split;
        varying vec2 vUv;

        void main() {
          // Linear gradient where bottom 25% is darker
          float t = clamp(vUv.y / split, 0.0, 1.0);
          vec3 color = mix(bottomColor, topColor, t);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }, []);

  return (
    <mesh renderOrder={-1} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
