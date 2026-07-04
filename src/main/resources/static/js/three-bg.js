/* Logi_Assist - animated starfield + floating cubes background using Three.js */

(function initThreeBackground() {
    if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded, skipping background animation');
        return;
    }

    const canvas = document.getElementById('bg-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // ---------- Starfield ----------
    const starCount = 600;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
        starPositions[i * 3] = (Math.random() - 0.5) * 200;
        starPositions[i * 3 + 1] = (Math.random() - 0.5) * 200;
        starPositions[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
        color: 0x9fc9ff,
        size: 0.5,
        transparent: true,
        opacity: 0.7
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // ---------- Floating cubes ----------
    const cubes = [];
    const cubeColors = [0x3fc9ff, 0xa855f7, 0x4a7dff, 0xe879f9];
    const cubeCount = 9;

    for (let i = 0; i < cubeCount; i++) {
        const size = 0.6 + Math.random() * 1.4;
        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshBasicMaterial({
            color: cubeColors[i % cubeColors.length],
            wireframe: true,
            transparent: true,
            opacity: 0.55
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 25,
            (Math.random() - 0.5) * 20 - 5
        );
        cube.userData = {
            rotSpeedX: (Math.random() - 0.5) * 0.01,
            rotSpeedY: (Math.random() - 0.5) * 0.01,
            floatSpeed: 0.2 + Math.random() * 0.3,
            floatOffset: Math.random() * Math.PI * 2,
            baseY: cube.position.y
        };
        cubes.push(cube);
        scene.add(cube);
    }

    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        stars.rotation.y += 0.0002;

        cubes.forEach((cube) => {
            cube.rotation.x += cube.userData.rotSpeedX;
            cube.rotation.y += cube.userData.rotSpeedY;
            cube.position.y = cube.userData.baseY + Math.sin(t * cube.userData.floatSpeed + cube.userData.floatOffset) * 1.2;
        });

        camera.position.x += (mouseX * 2 - camera.position.x) * 0.02;
        camera.position.y += (-mouseY * 2 - camera.position.y) * 0.02;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    }
    animate();
})();
