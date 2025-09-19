import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import './GridDistortion.css';

const GridDistortion = ({ isDarkMode = true }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    mountRef.current.appendChild(renderer.domElement);

    // Grid geometry
    const gridSize = 50;
    const gridDivisions = 100;
    
    // Create custom grid geometry with more vertices for distortion
    const geometry = new THREE.PlaneGeometry(gridSize, gridSize, gridDivisions, gridDivisions);
    
    // Vertex shader for grid distortion
    const vertexShader = `
      uniform float uTime;
      uniform vec2 uMouse;
      varying vec2 vUv;
      varying float vElevation;
      
      void main() {
        vUv = uv;
        
        // Mouse influence
        vec2 mouseInfluence = uMouse * 2.0 - 1.0;
        float mouseDistance = distance(uv, mouseInfluence * 0.5 + 0.5);
        float mouseEffect = smoothstep(0.5, 0.0, mouseDistance) * 2.0;
        
        // Wave distortion
        float wave1 = sin(position.x * 0.3 + uTime * 2.0) * 0.8;
        float wave2 = cos(position.y * 0.2 + uTime * 1.5) * 0.6;
        float wave3 = sin(distance(position.xy, vec2(0.0)) * 0.05 + uTime) * 1.0;
        
        vec3 newPosition = position;
        newPosition.z += wave1 + wave2 + wave3 + mouseEffect;
        
        vElevation = newPosition.z;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `;

    // Fragment shader for grid appearance
    const fragmentShader = `
      uniform float uTime;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      varying vec2 vUv;
      varying float vElevation;
      
      void main() {
        // Grid lines
        vec2 grid = abs(fract(vUv * 20.0) - 0.5) / fwidth(vUv * 20.0);
        float line = min(grid.x, grid.y);
        float gridMask = 1.0 - min(line, 1.0);
        
        // Color based on elevation and time
        vec3 color = mix(uColor1, uColor2, vElevation * 0.5 + 0.5);
        color = mix(color, uColor2 * 1.5, sin(uTime + vElevation * 10.0) * 0.3 + 0.3);
        
        // Fade edges
        float fadeX = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
        float fadeY = smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
        float fade = fadeX * fadeY;
        
        gl_FragColor = vec4(color, gridMask * fade * 0.9);
      }
    `;

    // Material with custom shaders - theme-aware colors
    const gridColor = isDarkMode ? 0xffffff : 0x333333; // White for dark mode, dark gray for light mode
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uColor1: { value: new THREE.Color(gridColor) },
        uColor2: { value: new THREE.Color(gridColor) }
      },
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 3; // Tilt the grid
    scene.add(mesh);

    // Position camera
    camera.position.set(0, 15, 20);
    camera.lookAt(0, 0, 0);

    // Mouse tracking
    const mouse = new THREE.Vector2();
    const handleMouseMove = (event) => {
      mouse.x = event.clientX / window.innerWidth;
      mouse.y = 1 - (event.clientY / window.innerHeight);
      material.uniforms.uMouse.value = mouse;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      material.uniforms.uTime.value += 0.01;
      
      // Gentle camera movement
      camera.position.x = Math.sin(material.uniforms.uTime.value * 0.1) * 2;
      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [isDarkMode]);

  return <div ref={mountRef} className="grid-distortion" />;
};

export default GridDistortion;
