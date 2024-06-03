import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box';
import { Alert, LinearProgress, Stack, TextField, Typography, createTheme } from '@mui/material';
import Log from '@/scripts/Log';
import Chat from './Chat';
import Status from './status/Status';
import ShieldIcon from '@mui/icons-material/Shield';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import { createRoot } from 'react-dom/client';
import Statusbar from './Statusbar';

export default function Scene({ app }) {
	const [registry, systems] = app.get();
	const raycaster = systems.get('Raycaster');
	const moba = systems.get('Moba');
	const [isInventoryOpen, setInventoryOpen] = useState(false);
	const onRightClick = (e) => {
		// e.preventDefault();
		const intersection = raycaster.getCursorIntersection();
		const player = systems.get('Player');
		moba.moveToRpc(player.getPlayerEntity(), intersection.worldPosition);
	}
	useEffect(() => {
		const renderer = systems.get('Renderer')
		renderer.setSceneElement(document.getElementById("scene"));
		function loop() {
			requestAnimationFrame(loop);
			systems.tick();
		}
		loop();
		return () => {
			Log.debug(`Scene.useEffect return`);
			renderer.onSceneElementResize();
		};
	}, []);
	function onKeyDown(e) {
		Log.info(`Key pressed: ${e.key}`);
		// if pressed e, toggle inventory
		if (e.key === 'e') {
			setInventoryOpen(prev => !prev);
		}
	}
	return (
		<Box className="col grow" id="scene" onContextMenu={onRightClick} >
			<div
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					pointerEvents: 'none',
					backgroundColor: 'transparent',
				}}
				tabIndex="0"
				onKeyDown={onKeyDown}
			>
				{
					isInventoryOpen && <div style={{
						display: 'flex',
						flexDirection: 'column',
						width: '512px',
						height: '512px',
						margin: 'auto',
						marginBottom: 0,
						backgroundColor: 'rgba(0,0,0,0.5)',
					}}>

					</div>
				}

				<div style={{
					display: 'flex',
					marginLeft: 'auto',
					marginRight: 'auto',
					marginTop: 'auto',
					pointerEvents: 'auto',
					flexDirection: 'column',
				}}>

					<Typography variant="h6">
						Use mouse left/right click and scroll to move camera.
					</Typography>
					<div style={{
						display: 'flex',
						flexDirection: 'column',
						width: '100%',
						padding: 0,
						margin: 0,
					}}>
						<Statusbar app={app} icon={<FavoriteIcon />} />
						<Statusbar app={app} icon={<RestaurantIcon />} />
						<Statusbar app={app} icon={<LocalDrinkIcon />} />
					</div>
				</div>
			</div>
		</Box >
	);
}