import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SimulationManager } from './simulationManager.js';

class CrisisLabEngine {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.racks = [];
        this.floor = null;
        this.hub = null;

        this.init();
        this.createEnvironment(1);

        this.sim = new SimulationManager(this);

        this.isShaking = false;
        this.shakeIntensity = 0;

        this.animate();

        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('click', (e) => this.onMouseClick(e));
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x0a0e14, 1);
        this.container.appendChild(this.renderer.domElement);

        this.camera.position.set(0, 15, 25);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.maxPolarAngle = Math.PI / 2.1;

        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(this.ambientLight);

        this.grid = new THREE.GridHelper(100, 100, 0x00f2ff, 0x1e293b);
        this.grid.position.y = -0.01;
        this.scene.add(this.grid);
    }

    createEnvironment(level) {
        this.racks.forEach(r => this.scene.remove(r));
        this.racks = [];

        const floorSize = 40 + (level * 15);
        if (this.floor) this.scene.remove(this.floor);
        const floorGeo = new THREE.PlaneGeometry(floorSize, floorSize);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x0f172a, roughness: 0.8, metalness: 0.5
        });
        this.floor = new THREE.Mesh(floorGeo, floorMat);
        this.floor.rotation.x = -Math.PI / 2;
        this.scene.add(this.floor);

        this.createConsoleHub();

        const rows = 2 + Math.floor(level / 2);
        const cols = 2 + Math.floor(level / 2);
        const spacingX = 10;
        const spacingZ = 15;

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                this.createServerRack(
                    (i * spacingX) - ((cols - 1) * spacingX / 2),
                    0,
                    (j * spacingZ) - ((rows - 1) * spacingZ / 2) + 10
                );
            }
        }
    }

    createConsoleHub() {
        if (this.hub) this.scene.remove(this.hub);
        this.hub = new THREE.Group();
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155 });

        const base = new THREE.Mesh(new THREE.CylinderGeometry(3, 3.5, 0.5, 32), baseMat);
        this.hub.add(base);

        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 3, 16), baseMat);
        pillar.position.y = 1.5;
        this.hub.add(pillar);

        const screen = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.5, 0.1), new THREE.MeshStandardMaterial({
            color: 0x000000, emissive: 0x00f2ff, emissiveIntensity: 0.2
        }));
        screen.position.set(0, 3.5, 0.3);
        screen.rotation.x = -0.3;
        this.hub.add(screen);

        this.scene.add(this.hub);
    }

    createServerRack(x, y, z) {
        const group = new THREE.Group();
        group.userData = { id: `rack_${this.racks.length}`, type: 'rack' };

        const body = new THREE.Mesh(new THREE.BoxGeometry(2, 5, 2), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 }));
        body.position.y = 2.5;
        group.add(body);

        const face = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 4.8), new THREE.MeshStandardMaterial({
            color: 0x0a0e14, transparent: true, opacity: 0.7, emissive: 0x10b981, emissiveIntensity: 0.1
        }));
        face.position.set(0, 2.5, 1.01);
        group.add(face);

        const led = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
        led.position.set(0.6, 4.5, 1.05);
        led.name = "statusLED";
        group.add(led);

        group.position.set(x, y, z);
        this.scene.add(group);
        this.racks.push(group);
    }

    setRackAlarm(rack, active) {
        const led = rack.getObjectByName("statusLED");
        if (led) led.material.color.setHex(active ? 0xff4b2b : 0x10b981);

        const face = rack.children.find(c => c.geometry.type === "PlaneGeometry");
        if (face) {
            face.material.emissive.setHex(active ? 0xff4b2b : 0x10b981);
            face.material.emissiveIntensity = active ? 0.5 : 0.1;
        }
    }

    toggleShake(active, intensity = 0.5) {
        this.isShaking = active;
        this.shakeIntensity = intensity;
    }

    updateCollapsingState(stability) {
        const vignette = document.getElementById('vignette');
        const hud = document.getElementById('hud');

        if (stability < 20) {
            vignette.classList.remove('hidden');
            vignette.classList.add('critical');
            hud.classList.add('glitch');
            this.toggleShake(true, (20 - stability) / 20);
            this.ambientLight.color.setHex(0xff0000);
            this.ambientLight.intensity = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
        } else {
            vignette.classList.add('hidden');
            vignette.classList.remove('critical');
            hud.classList.remove('glitch');
            this.toggleShake(false);
            this.ambientLight.color.setHex(0xffffff);
            this.ambientLight.intensity = 0.3;
        }
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onMouseClick() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        if (intersects.length > 0) {
            let obj = intersects[0].object;
            while (obj.parent && !obj.userData.type) obj = obj.parent;
            if (obj.userData.type === 'rack') this.sim.handleRackInteraction(obj);
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (this.isShaking) {
            this.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity;
            this.camera.position.z += (Math.random() - 0.5) * this.shakeIntensity;
        }
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

new CrisisLabEngine();
