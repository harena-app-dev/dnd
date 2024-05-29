import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box';
import * as THREE from 'three';
import SpriteRenderer from '@/scripts/systems/SpriteRender';

export default function Scene({ registry }) {
	useEffect(() => {
		const scene = new THREE.Scene();
		const spriteRenderer = SpriteRenderer({ registry, scene });
		const renderer = new THREE.WebGLRenderer();
		const sceneElement = document.getElementById("scene");
		renderer.setSize(sceneElement.clientWidth, sceneElement.clientHeight);
		const camera = new THREE.PerspectiveCamera(75, sceneElement.clientWidth / sceneElement.clientHeight, 0.1, 1000);
		sceneElement.appendChild(renderer.domElement);
		camera.position.z = 5;

		function animate() {
			requestAnimationFrame(animate);
			renderer.render(scene, camera);
			// registry.each({
			// 	types: ["Sprite"], 
			// 	callback: ({ entity }) => {
			// 		Log.debug(`Rendering sprite for entity ${entity}`) // eslint-disable-line no-console
			// 	}
			// })
			spriteRenderer.onRender();
		}

		animate();
		return () => {
			sceneElement.removeChild(renderer.domElement);
			spriteRenderer.deconstruct();
		};
	}, []);
	return (
		<Box className="col grow" id="scene">
		</Box>
	);
}