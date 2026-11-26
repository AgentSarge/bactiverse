import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type SpecimenShape = 'rod' | 'spherical' | 'spiral' | 'other';

export interface SpecimenViewerProps {
	shape: SpecimenShape;
	label: string;
	/** Specimen id. Picks the bright color set for this colony. */
	slug?: string;
	/** `play` idles, then speeds up on hover. `hover` stays still until the pointer is over it. */
	motion?: 'play' | 'hover';
	/** Detail stage uses a sharper backing store than a browse card. */
	quality?: 'detail' | 'card';
}

/** Saturated hues that stay readable on the black stage. */
const PALETTES: Record<string, number[]> = {
	'escherichia-coli': [0x3ee0ff, 0x4d7cff, 0x7af0ff, 0x2f6bff],
	'lactobacillus-acidophilus': [0xc6ff3a, 0x7dff6a, 0xe8ff5a, 0x3dffc8],
	'bacillus-subtilis': [0xffc23a, 0xff8a1e, 0xffe56a, 0xff5a1f],
	'staphylococcus-epidermidis': [0xff4fd8, 0xc45bff, 0xff7ae0, 0x8a5cff],
	'streptococcus-thermophilus': [0xff5a8a, 0xff3d6e, 0xff9a6a, 0xff4fd8],
	'helicobacter-pylori': [0xff6b3d, 0xffc23a, 0xff3d8a, 0xffe14a],
	'streptomyces-coelicolor': [0x4d7cff, 0x3ee0ff, 0xb45bff, 0x6a5cff],
	'deinococcus-radiodurans': [0xff3b5c, 0xff6b8a, 0xff2d2d, 0xff8a3d],
	'thermus-aquaticus': [0xff7a18, 0xffd23a, 0xff4d1a, 0xffb020],
	'caulobacter-crescentus': [0x2ee6a6, 0x3ee0ff, 0xb6ff3e, 0x1ad1ff],
	'synechocystis-pcc-6803': [0x5dff4a, 0xc6ff3a, 0x2ee6a6, 0xe8ff5a],
	'magnetospirillum-magneticum': [0xb45bff, 0x6a7bff, 0xff4fd8, 0x3ee0ff],
};

function paletteFor(slug: string): number[] {
	const known = PALETTES[slug];
	if (known) return known;
	let hash = 0;
	for (let i = 0; i < slug.length; i += 1) hash = (hash * 33 + slug.charCodeAt(i)) >>> 0;
	const base = hash % 360;
	return [0, 32, 64, 96].map((offset) =>
		new THREE.Color().setHSL(((base + offset) % 360) / 360, 0.92, 0.6).getHex(),
	);
}

function paintGradient(geo: THREE.BufferGeometry, colors: number[]) {
	const pos = geo.getAttribute('position');
	geo.computeBoundingBox();
	const box = geo.boundingBox;
	if (!box) return;
	const span = Math.max(box.max.x - box.min.x, 0.001);
	const data = new Float32Array(pos.count * 3);
	const from = new THREE.Color();
	const to = new THREE.Color();
	for (let i = 0; i < pos.count; i += 1) {
		const t = THREE.MathUtils.clamp((pos.getX(i) - box.min.x) / span, 0, 1);
		const scaled = t * (colors.length - 1);
		const index = Math.min(colors.length - 2, Math.floor(scaled));
		from.setHex(colors[index]);
		to.setHex(colors[index + 1]);
		from.lerp(to, scaled - index);
		data[i * 3] = from.r;
		data[i * 3 + 1] = from.g;
		data[i * 3 + 2] = from.b;
	}
	geo.setAttribute('color', new THREE.BufferAttribute(data, 3));
}

/** Dark specimen plate with a slowly turning 3D colony. */
export default function SpecimenViewer({
	shape,
	label,
	slug = '',
	motion = 'play',
	quality = 'detail',
}: SpecimenViewerProps) {
	const wrapRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const wrap = wrapRef.current;
		const canvas = canvasRef.current;
		if (!wrap || !canvas) return;

		const renderer = new THREE.WebGLRenderer({
			canvas,
			antialias: true,
			powerPreference: 'high-performance',
		});
		const pixelCap = quality === 'detail' ? 3 : 2.5;
		const pixelRatio = Math.min(pixelCap, Math.max(window.devicePixelRatio || 1, 2));
		renderer.setPixelRatio(pixelRatio);
		renderer.setClearColor(0x121212, 1);
		renderer.outputColorSpace = THREE.SRGBColorSpace;
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1.08;

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);

		const colors = paletteFor(slug);
		scene.add(new THREE.AmbientLight(0xffffff, 0.55));
		const key = new THREE.DirectionalLight(0xffffff, 2.5);
		key.position.set(2.4, 4.2, 2.2);
		scene.add(key);
		const rim = new THREE.PointLight(colors[1] ?? colors[0], 18, 9);
		rim.position.set(-1.8, 1.4, 1.2);
		scene.add(rim);

		const materials: THREE.Material[] = [];
		function cellMaterial(hex: number, vertexColors = false) {
			const material = new THREE.MeshStandardMaterial({
				color: vertexColors ? 0xffffff : hex,
				emissive: hex,
				emissiveIntensity: vertexColors ? 0.28 : 0.48,
				roughness: 0.24,
				metalness: 0.06,
				vertexColors,
			});
			materials.push(material);
			return material;
		}

		const colony = new THREE.Group();
		scene.add(colony);
		const geos: THREE.BufferGeometry[] = [];

		if (shape === 'spherical') {
			const geo = new THREE.SphereGeometry(0.2, 64, 40);
			geos.push(geo);
			const bunches: Array<[number, number, number]> = [
				[-0.48, 0.05, 0.05],
				[0.42, 0.12, -0.08],
				[0.02, -0.08, 0.46],
			];
			const offsets: Array<[number, number, number]> = [
				[0, 0, 0],
				[0.22, 0.1, 0.04],
				[-0.16, 0.16, 0.1],
				[0.06, 0.2, -0.16],
			];
			let index = 0;
			for (const [bx, by, bz] of bunches) {
				for (const [ox, oy, oz] of offsets) {
					const mesh = new THREE.Mesh(geo, cellMaterial(colors[index % colors.length]));
					mesh.position.set(bx + ox, by + oy, bz + oz);
					colony.add(mesh);
					index += 1;
				}
			}
			camera.position.set(0.3, 0.35, 2.7);
			camera.lookAt(0, 0.12, 0);
		} else if (shape === 'spiral') {
			const helices: Array<[number, number, number, number]> = [
				[0.28, 1.55, 2.1, 0],
				[0.16, 1.25, 2.4, 0.12],
			];
			helices.forEach(([radius, height, turns, yOffset], helixIndex) => {
				const points: THREE.Vector3[] = [];
				const steps = 90;
				for (let i = 0; i <= steps; i += 1) {
					const t = (i / steps) * Math.PI * 2 * turns;
					points.push(
						new THREE.Vector3(
							Math.cos(t) * radius + (helixIndex - 0.5) * 0.35,
							(i / steps - 0.5) * height + yOffset,
							Math.sin(t) * radius,
						),
					);
				}
				const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 240, 0.045, 20, false);
				const shifted = colors.slice(helixIndex).concat(colors.slice(0, helixIndex));
				paintGradient(geo, shifted);
				geos.push(geo);
				colony.add(new THREE.Mesh(geo, cellMaterial(shifted[0], true)));
			});
			camera.position.set(1.7, 0.25, 2.5);
			camera.lookAt(0, 0.1, 0);
		} else if (shape === 'other') {
			const geo = new THREE.CylinderGeometry(0.028, 0.028, 1, 24);
			geos.push(geo);
			const branches: Array<[number, number, number, number, number]> = [
				[0, 0.15, 0, 0.55, 0.15],
				[0.12, 0.48, 0.04, 0.85, 0.55],
				[-0.16, 0.42, -0.04, 0.7, -0.65],
				[0.38, 0.78, 0.08, 0.42, 1.05],
				[-0.42, 0.7, -0.02, 0.38, -1.15],
				[0.22, 0.95, 0.12, 0.28, 0.2],
			];
			branches.forEach(([x, y, z, length, rot], index) => {
				const mesh = new THREE.Mesh(geo, cellMaterial(colors[index % colors.length]));
				mesh.scale.set(1, length, 1);
				mesh.position.set(x, y, z);
				mesh.rotation.z = rot;
				colony.add(mesh);
			});
			camera.position.set(0.85, 0.55, 3.15);
			camera.lookAt(0, 0.45, 0);
		} else {
			const geo = new THREE.CapsuleGeometry(0.08, 0.62, 12, 32);
			geos.push(geo);
			const rods: Array<[number, number, number, number]> = [
				[-0.72, 0.15, 0.12, 1.05],
				[-0.18, 0.42, 0.05, 0.25],
				[0.48, 0.12, -0.16, -0.7],
				[0.08, 0.62, -0.28, 1.35],
				[-0.38, -0.05, 0.42, -0.15],
				[0.7, 0.38, 0.22, 0.55],
			];
			rods.forEach(([x, y, z, rot], index) => {
				const mesh = new THREE.Mesh(geo, cellMaterial(colors[index % colors.length]));
				mesh.position.set(x, y, z);
				mesh.rotation.z = rot;
				mesh.rotation.y = rot * 0.45;
				colony.add(mesh);
			});
			camera.position.set(0.45, 0.4, 3.15);
			camera.lookAt(0, 0.22, 0);
		}

		const lookTarget = new THREE.Vector3(0, 0.22, 0);
		if (shape === 'spherical') lookTarget.set(0, 0.12, 0);
		else if (shape === 'spiral') lookTarget.set(0, 0.1, 0);
		else if (shape === 'other') lookTarget.set(0, 0.45, 0);
		const homeOffset = camera.position.clone().sub(lookTarget);

		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const clock = new THREE.Clock();
		let frame = 0;
		let spin = 0;
		const idleSpeed = motion === 'play' ? 0.28 : 0;
		const hoverSpeed = 0.55;
		let targetSpeed = idleSpeed;
		let speed = idleSpeed;
		const host = wrap.closest('.bacterium-card') ?? wrap.closest('.preview-stage') ?? wrap;

		function onEnter() {
			targetSpeed = hoverSpeed;
		}
		function onLeave() {
			targetSpeed = idleSpeed;
		}
		host.addEventListener('pointerenter', onEnter);
		host.addEventListener('pointerleave', onLeave);

		function resize() {
			const width = wrap?.clientWidth || 640;
			const height = wrap?.clientHeight || 480;
			const aspect = width / Math.max(height, 1);
			let distance = homeOffset.length();
			if (quality === 'detail') {
				const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
				const needed = 1.85 / (Math.tan(halfFov) * Math.max(aspect, 0.35));
				distance = Math.max(distance * 1.35, needed);
			}
			camera.position.copy(lookTarget).add(homeOffset.clone().normalize().multiplyScalar(distance));
			camera.aspect = aspect;
			camera.lookAt(lookTarget);
			camera.updateProjectionMatrix();
			renderer.setSize(width, height, false);
		}

		resize();
		const observer = new ResizeObserver(resize);
		observer.observe(wrap);

		function tick() {
			const dt = Math.min(clock.getDelta(), 0.033);
			if (!reduce) {
				speed += (targetSpeed - speed) * Math.min(1, dt * 3);
				spin += dt * speed;
				colony.rotation.y = spin;
			}
			renderer.render(scene, camera);
			frame = requestAnimationFrame(tick);
		}
		tick();

		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
			host.removeEventListener('pointerenter', onEnter);
			host.removeEventListener('pointerleave', onLeave);
			for (const geo of geos) geo.dispose();
			for (const material of materials) material.dispose();
			renderer.dispose();
		};
	}, [shape, motion, quality, slug]);

	return (
		<div className="specimen-viewer" ref={wrapRef}>
			<canvas ref={canvasRef} role="img" aria-label={label} />
		</div>
	);
}
