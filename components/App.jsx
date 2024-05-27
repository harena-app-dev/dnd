import React, { useEffect, useRef, useState } from 'react'
import WebSocketMessager from '@/scripts/client/WebSocketMessager';
import RegistryView from '@/components/RegistryView';
import { NetworkedRegistry as NetworkedRegistry } from '@/scripts/NetworkedRegistry';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Entity from '@/scripts/dnd/Entity';
import EntityView from '@/components/EntityView';
import Console from '@/components/Console';
import Scene from './Scene';
export default function App() {
	const webSocketMessager = useRef();
	const [registry, setRegistry] = useState(NetworkedRegistry());
	useEffect(function () {
		webSocketMessager.current = new WebSocketMessager(function () {
			registry.connect({ wsm: webSocketMessager.current, isClient: true });
		});
		return () => {
			webSocketMessager.current?.close();
		};
	}, []);
	const [viewedEntity, setViewedEntity] = useState(0);
	return <Box className="row grow">
		<RegistryView registry={registry} setViewedEntity={setViewedEntity} />
		<Box className='col'>
			<EntityView registry={registry} entity={viewedEntity} />
			<Console registry={registry} />
		</Box>
		<Scene registry={registry} />
	</Box>
}