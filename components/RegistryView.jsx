import { useEffect, useState } from "react";
import EntityView from "@/components/EntityView";
import AccordionSummary from '@mui/material/AccordionSummary';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { Stack } from "@mui/material";

export default function RegistryView({ registry }) {
	const [entityElements, setEntityElements] = useState([]);
	useEffect(function () {
		console.log(`useEffect`);
		const observer = ({ entity }) => {
			setEntityElements((entityElements) => {
				return [...entityElements, <EntityView key={entity} registry={registry} entity={entity} />];
			});
		};
		registry.onCreate.connect(observer);
		return () => {
			registry.onCreate.disconnect(observer);
		};
	}, []);
	const [width, setWidth] = useState(256);
	return <Box className='row resizable' style={{
		width: width + 'px',
	}} sx={{ p: 2 }}>
		<Stack className='col grow' spacing={2}>
			<Typography variant="overline" display="block" gutterBottom>
				entitites
			</Typography>
			<Stack className='col grow scroll-y'>
				<Button variant="contained"
					onClick={() => {
						registry.cmdCreate();
					}}>
					+
				</Button>
				{
					entityElements
				}
			</Stack>
		</Stack>
		{/* <div className='col vertical-resizer'
			onMouseDown={(e) => {
				console.log(`onMouseDown`);
				const startX = e.clientX;
				const startWidth = width;
				const onMouseMove = (e) => {
					console.log(`onMouseMove`);
					const dx = e.clientX - startX;
					const newSize = startWidth + dx;
					setWidth(newSize);
				};
				const onMouseUp = () => {
					console.log(`onMouseUp`);
					document.removeEventListener('mousemove', onMouseMove);
					document.removeEventListener('mouseup', onMouseUp);
				};
				document.addEventListener('mousemove', onMouseMove);
				document.addEventListener('mouseup', onMouseUp);
			}}>
		</div> */}
	</Box>
}