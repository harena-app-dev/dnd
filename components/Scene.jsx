import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box';
import * as THREE from 'three';
import SpriteRenderer from '@/scripts/systems/SpriteRender';
import { Alert } from '@mui/material';
import MouseManager from '@/scripts/systems/MouseManager'
import FPCamera from '@/scripts/systems/FPCamera';
import KeyboardState from '@/scripts/systems/KeyboardState';

export default function Scene({ registry, setViewedEntity }) {
	const [content, setContent] = useState(<Alert
		sx={{ margin: 'auto' }}
		severity="error">
		No camera found. Please add a camera to the scene.
	</Alert>);
	useEffect(() => {
		const scene = new THREE.Scene();
		const spriteRenderer = SpriteRenderer({ registry, scene });
		const renderer = new THREE.WebGLRenderer();
		const sceneElement = document.getElementById("scene");
		renderer.setSize(sceneElement.clientWidth, sceneElement.clientHeight);
		sceneElement.appendChild(renderer.domElement);
		const widthHeight = new THREE.Vector2(sceneElement.clientWidth, sceneElement.clientHeight);
		let zoom = 100;
		const camera = new THREE.OrthographicCamera(widthHeight.x / -zoom, widthHeight.x / zoom, widthHeight.y / zoom, widthHeight.y / -zoom, 0.001, 1000);
		camera.position.z = 5;
		const keyboardState = new KeyboardState();

		const raycaster = new THREE.Raycaster();
		const pointer = new THREE.Vector2();

		function onPointerMove(event) {
			const offset = sceneElement.getBoundingClientRect();
			pointer.x = ((event.clientX - offset.left) / widthHeight.x) * 2 - 1;
			pointer.y = -((event.clientY - offset.top) / widthHeight.y) * 2 + 1;
		}

		window.addEventListener('pointermove', onPointerMove);

		function onPointerDown(event) {
			const intersects = raycaster.intersectObjects(scene.children);
			if (intersects.length > 0) {
				console.log("Intersects", intersects.length);
				for (let i = 0; i < intersects.length; i++) {
					
					const entity = spriteRenderer.getEntityFromThree(intersects[i].object.id); 
					console.log("Intersect", { 
						i, 
						entity, 
						sprite: registry.get({ type: 'Sprite', entity })
					});
				}
				// const entity = spriteRenderer.getEntityFromThree(intersects[0].object.id);
				const entity = spriteRenderer.getEntityFromThree(intersects[0].object.id);
				setViewedEntity(entity);
			}
		}

		window.addEventListener('pointerdown', onPointerDown);

		function onRender() {
			requestAnimationFrame(onRender);

			camera.left = -widthHeight.x / zoom;
			camera.right = widthHeight.x / zoom;
			camera.top = widthHeight.y / zoom;
			camera.bottom = -widthHeight.y / zoom;
			camera.updateProjectionMatrix();
			renderer.render(scene, camera);
			spriteRenderer.onRender();
			const cameraSpeed = 10;
			if (keyboardState.isKeyDown('a')) {
				camera.position.x -= cameraSpeed / zoom;
			}
			if (keyboardState.isKeyDown('d')) {
				camera.position.x += cameraSpeed / zoom;
			}
			if (keyboardState.isKeyDown('w')) {
				camera.position.y += cameraSpeed / zoom;
			}
			if (keyboardState.isKeyDown('s')) {
				camera.position.y -= cameraSpeed / zoom;
			}
			if (keyboardState.isKeyDown(' ')) {
				zoom -= 1;
			}
			if (keyboardState.isKeyDown('shift')) {
				zoom += 1;
			}

			raycaster.setFromCamera(pointer, camera);
			const intersects = raycaster.intersectObjects(scene.children);
			for (let i = 0; i < THREE.MathUtils.clamp(intersects.length, 0, 1); i++) {
			}
		}
		onRender();
		return () => {
			sceneElement.removeChild(renderer.domElement);
			spriteRenderer.deconstruct();
		};
	}, []);
	return (
		<Box className="col grow" id="scene">
			{/* {content} */}
		</Box>
	);
}