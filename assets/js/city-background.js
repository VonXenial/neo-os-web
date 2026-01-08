function initCityBackground() {
    const canvas = document.getElementById('cyber-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a14);
    scene.fog = new THREE.Fog(0x0a0a14, 20, 100);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 30);
    camera.lookAt(0, 5, 0);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Iluminación
    const ambientLight = new THREE.AmbientLight(0x111122, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00ccff, 0.6);
    dirLight.position.set(10, 20, 15);
    scene.add(dirLight);

    // Crear ciudad procedural
    const buildings = [];
    const buildingGroup = new THREE.Group();
    scene.add(buildingGroup);

    const buildingMaterials = [
        new THREE.MeshStandardMaterial({ color: 0xff0066, emissive: 0xff0033, emissiveIntensity: 0.8, metalness: 0.9, roughness: 0.2 }),
        new THREE.MeshStandardMaterial({ color: 0x00ccff, emissive: 0x0066ff, emissiveIntensity: 0.9, metalness: 0.85, roughness: 0.1 }),
        new THREE.MeshStandardMaterial({ color: 0xff9900, emissive: 0xff6600, emissiveIntensity: 0.7, metalness: 0.95, roughness: 0.05 }),
    ];

    for (let i = -10; i <= 10; i++) {
        for (let j = -10; j <= 10; j++) {
            if (Math.random() > 0.3) continue; // espaciado irregular

            const width = 2 + Math.random() * 3;
            const depth = 2 + Math.random() * 3;
            const height = 10 + Math.random() * 30;

            const geometry = new THREE.BoxGeometry(width, height, depth);
            const material = buildingMaterials[Math.floor(Math.random() * buildingMaterials.length)];
            const building = new THREE.Mesh(geometry, material);
            building.position.set(i * 6, height / 2, j * 6);
            building.castShadow = true;
            building.receiveShadow = true;

            // Añadir ventanas (emisivas)
            const windowGeo = new THREE.PlaneGeometry(0.4, 0.6);
            const windowMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.9 });
            for (let w = 0; w < Math.floor(height / 2); w++) {
                if (Math.random() > 0.4) {
                    const win = new THREE.Mesh(windowGeo, windowMat.clone());
                    win.position.set(
                        (Math.random() - 0.5) * width * 0.8,
                        -height / 2 + 1 + w * 1.2,
                        depth / 2 + 0.01
                    );
                    win.rotation.x = -Math.PI / 2;
                    building.add(win);
                }
            }

            buildingGroup.add(building);
            buildings.push(building);
        }
    }

    // Añadir "neon signs"
    const neonGeo = new THREE.PlaneGeometry(3, 1);
    const neonMat = new THREE.MeshBasicMaterial({
        color: 0xff00cc,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide
    });
    const neon = new THREE.Mesh(neonGeo, neonMat);
    neon.position.set(12, 8, -2);
    neon.rotation.y = Math.PI / 4;
    scene.add(neon);

    // Animación de cámara (vuela suavemente)
    let time = 0;
    const animate = () => {
        requestAnimationFrame(animate);
        time += 0.002;

        camera.position.x = Math.sin(time) * 40;
        camera.position.z = Math.cos(time) * 40 + 20;
        camera.position.y = 15 + Math.sin(time * 0.7) * 5;
        camera.lookAt(0, 8, 0);

        // Parpadeo de ventanas
        buildings.forEach(b => {
            b.children.forEach(c => {
                if (c.material) {
                    c.material.opacity = 0.7 + Math.sin(time * 3 + Math.random() * 10) * 0.3;
                }
            });
        });

        // Neon parpadeante
        neon.material.opacity = 0.7 + Math.sin(time * 5) * 0.3;

        renderer.render(scene, camera);
    };
    animate();

    // Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
