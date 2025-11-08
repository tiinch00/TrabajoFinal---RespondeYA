import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const Logo3D = () => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const groupRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xa855f7, 1.2, 100);
    pointLight1.position.set(5, 5, 5);
    pointLight1.castShadow = true;
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x06b6d4, 0.8, 100);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    const boxGeometry = new THREE.BoxGeometry(0.6, 1, 0.2);
    const boxMaterial = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      metalness: 0.7,
      roughness: 0.2,
      emissive: 0xa855f7,
      emissiveIntensity: 0.3,
    });
    const box1 = new THREE.Mesh(boxGeometry, boxMaterial);
    box1.position.x = -0.5;
    box1.castShadow = true;
    group.add(box1);

    const box2 = new THREE.Mesh(boxGeometry, boxMaterial);
    box2.position.x = 0.5;
    box2.castShadow = true;
    group.add(box2);

    const sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      metalness: 0.8,
      roughness: 0.1,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.4,
    });

    const sphere1 = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere1.position.set(-0.5, 0.6, 0.3);
    sphere1.castShadow = true;
    group.add(sphere1);

    const sphere2 = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere2.position.set(0.5, 0.6, 0.3);
    sphere2.castShadow = true;
    group.add(sphere2);

    const torusGeometry = new THREE.TorusGeometry(1.4, 0.1, 32, 100);
    const torusMaterial = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0xf472b6,
      emissiveIntensity: 0.2,
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.rotation.x = Math.PI * 0.3;
    torus.castShadow = true;
    group.add(torus);

    const onMouseMove = (event) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', onMouseMove);

    const handleResize = () => {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      box1.rotation.x += 0.005;
      box1.rotation.y += 0.007;
      box2.rotation.x += 0.005;
      box2.rotation.y -= 0.007;
      sphere1.rotation.x += 0.01;
      sphere1.rotation.y += 0.01;
      sphere2.rotation.x -= 0.008;
      sphere2.rotation.y -= 0.01;
      torus.rotation.z += 0.002;

      if (isHovered) {
        group.rotation.x += (mouseRef.current.y - group.rotation.x) * 0.1;
        group.rotation.y += (mouseRef.current.x - group.rotation.y) * 0.1;
      } else {
        group.rotation.x += (0 - group.rotation.x) * 0.05;
        group.rotation.y += (0 - group.rotation.y) * 0.05;
      }

      const pulse = Math.sin(Date.now() * 0.005) * 0.08 + 1;
      box1.scale.set(pulse, pulse, pulse);
      box2.scale.set(pulse, pulse, pulse);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [isHovered]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className='w-12 h-12 sm:w-14 sm:h-14 relative cursor-pointer'
      style={{ background: 'transparent' }}
    />
  );
};

export default Logo3D;
