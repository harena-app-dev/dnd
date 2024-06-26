import { useEffect, useState } from "react";
import EntityView from "@/components/ecs/EntityView";
import RuleIcon from '@mui/icons-material/Rule';

import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import { MenuItem, Stack } from "@mui/material";
import * as React from 'react';
import PropTypes from 'prop-types';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import { visuallyHidden } from '@mui/utils';
import BasicMenu from "../BasicMenu";
import { MoreHorizRounded } from "@mui/icons-material";
import Console from "../Console";
import { nullEntity } from "@/scripts/Registry";
import Log from "@/scripts/log";

function createData(id) {
	return {
		id,
	};
}

function descendingComparator(a, b, orderBy) {
	if (b[orderBy] < a[orderBy]) {
		return -1;
	}
	if (b[orderBy] > a[orderBy]) {
		return 1;
	}
	return 0;
}

function getComparator(order, orderBy) {
	return order === 'desc'
		? (a, b) => descendingComparator(a, b, orderBy)
		: (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
	const stabilizedThis = array.map((el, index) => [el, index]);
	stabilizedThis.sort((a, b) => {
		const order = comparator(a[0], b[0]);
		if (order !== 0) {
			return order;
		}
		return a[1] - b[1];
	});
	return stabilizedThis.map((el) => el[0]);
}

const headCells = [
	{
		id: 'id',
		numeric: false,
		disablePadding: true,
		label: 'ID',
	}
];
function EnhancedTableHead(props) {
	const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, isSelecting } =
		props;
	const createSortHandler = (property) => (event) => {
		onRequestSort(event, property);
	};

	return (
		<TableHead>
			<TableRow>
				{
					isSelecting &&
					<TableCell sx={{}} padding={'checkbox'}>
						<Checkbox
							color="primary"
							indeterminate={numSelected > 0 && numSelected < rowCount}
							checked={rowCount > 0 && numSelected === rowCount}
							onChange={onSelectAllClick}
							inputProps={{
								'aria-label': 'select all desserts',
							}}
						/>
					</TableCell>
				}
				{headCells.map((headCell) => (
					<TableCell sx={{ height: 64 }}
						key={headCell.id}
						align={headCell.numeric ? 'right' : 'left'}
						sortDirection={orderBy === headCell.id ? order : false}
					>
						<TableSortLabel
							active={orderBy === headCell.id}
							direction={orderBy === headCell.id ? order : 'asc'}
							onClick={createSortHandler(headCell.id)}
						>
							{headCell.label}
							{orderBy === headCell.id ? (
								<Box component="span" sx={visuallyHidden}>
									{order === 'desc' ? 'sorted descending' : 'sorted ascending'}
								</Box>
							) : null}
						</TableSortLabel>
					</TableCell>
				))}
			</TableRow>
		</TableHead>
	);
}

EnhancedTableHead.propTypes = {
	numSelected: PropTypes.number.isRequired,
	onRequestSort: PropTypes.func.isRequired,
	onSelectAllClick: PropTypes.func.isRequired,
	order: PropTypes.oneOf(['asc', 'desc']).isRequired,
	orderBy: PropTypes.string.isRequired,
	rowCount: PropTypes.number.isRequired,
};

function EnhancedTableToolbar(props) {
	const { numSelected, setIsSelecting, registry, selected, client, setViewedEntity } = props;
	const actions = [
		{ icon: <RuleIcon />, name: 'Select', onClick: () => setIsSelecting(prev => !prev) },
		{
			icon: <AddIcon />, name: 'Create', onClick: () => client.promiseCreate().then((entity) => {
				setViewedEntity(entity);
			}),
		},
	];
	return (
		<Stack direction="column" spacing={0}>
			{numSelected > 0 ? (
				<Tooltip title="Delete">
					<IconButton onClick={() => {
						selected.forEach((entity) => {
							client.promiseDestroy({ entity: Number(entity) });
						});
					}}>
						<DeleteIcon />
					</IconButton>
				</Tooltip>
			) : (
				<BasicMenu button={<MoreHorizRounded />} >
					{actions.map((action) => (
						<MenuItem key={action.name} onClick={action.onClick}>
							{action.icon}
							{action.name}
						</MenuItem>
					))}

				</BasicMenu>
			)}
		</Stack>
	);
}

EnhancedTableToolbar.propTypes = {
	numSelected: PropTypes.number.isRequired,
};

export default function ({ registry, client, viewedEntity, setViewedEntity }) {

	const [rows, setRows] = React.useState(registry.view().map({
		callback: (entity) => {
			return createData(entity, entity);
		}
	}));
	const [order, setOrder] = React.useState('asc');
	const [orderBy, setOrderBy] = React.useState('calories');
	const [selected, setSelected] = React.useState([]);
	const [isSelecting, setIsSelecting] = React.useState(false);
	useEffect(function () {

		const onCreate = (entity) => {
			setRows((rows) => {
				return [...rows, createData(entity, entity)];
			});
		};
		registry.onCreate().connect(onCreate);
		const onDestroy = (entity) => {
			setRows((rows) => {
				Log.debug(`setRows destroy ${entity}`);
				return rows.filter((row) => row.id !== entity);
			});
			setSelected((selected) => {
				return selected.filter((id) => id !== entity);
			});
		};
		registry.onDestroy().connect(onDestroy);
		const onKeydown = (event) => {
			if (event.key === 'Escape') {
				setIsSelecting((prev) => {
					setSelected([]);
					return false;
				});
			}
		};
		document.addEventListener('keydown', onKeydown);
		return () => {
			registry.onCreate().disconnect(onCreate);
			registry.onDestroy().disconnect(onDestroy);
			document.removeEventListener('keydown', onKeydown);
		};
	}, []);
	const handleRequestSort = (event, property) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

	const handleSelectAllClick = (event) => {
		if (event.target.checked) {
			const newSelected = rows.map((n) => n.id);
			setSelected(newSelected);
			return;
		}
		setSelected([]);
	};

	function handleClick({ event, id }) {
		if (!isSelecting) {
			setViewedEntity(id);
			return;
		}
		const selectedIndex = selected.indexOf(id);
		let newSelected = [];

		if (selectedIndex === -1) {
			newSelected = newSelected.concat(selected, id);
		} else if (selectedIndex === 0) {
			newSelected = newSelected.concat(selected.slice(1));
		} else if (selectedIndex === selected.length - 1) {
			newSelected = newSelected.concat(selected.slice(0, -1));
		} else if (selectedIndex > 0) {
			newSelected = newSelected.concat(
				selected.slice(0, selectedIndex),
				selected.slice(selectedIndex + 1),
			);
		}
		setSelected(newSelected);
	};
	const isSelected = (id) => selected.indexOf(id) !== -1;
	const visibleRows = stableSort(rows, getComparator(order, orderBy));
	return (
		<Box className='row'>
			<Paper className='col grow'>
				<EnhancedTableToolbar numSelected={selected.length} setIsSelecting={setIsSelecting}
					registry={registry}
					selected={selected}
					client={client}
					setViewedEntity={setViewedEntity}
				/>
				<TableContainer className='col grow'>
					<Table
						aria-labelledby="tableTitle"
						className='col grow'
					>
						<EnhancedTableHead
							isSelecting={isSelecting}
							numSelected={selected.length}
							order={order}
							orderBy={orderBy}
							onSelectAllClick={handleSelectAllClick}
							onRequestSort={handleRequestSort}
							rowCount={rows.length}
						/>
						<TableBody className='scroll-y col grow'>
							{visibleRows.map((row, index) => {
								const isItemSelected = isSelected(row.id);
								const labelId = `enhanced-table-checkbox-${index}`;
								return (
									<TableRow
										hover
										onClick={(event) => handleClick({ event, id: row.id })}
										tabIndex={-1}
										key={row.id}
										selected={isItemSelected}
										sx={{ cursor: 'pointer' }}
									>
										{
											isSelecting &&
											<TableCell sx={{
												m: "auto"
											}} padding={'checkbox'}>
												<Checkbox
													checked={isItemSelected}
													inputProps={{
														'aria-labelledby': labelId,
													}}
												/>
											</TableCell>
										}
										<TableCell sx={{
											m: "auto",
											height: 64
										}}>
											{row.id}
										</TableCell>
									</TableRow>
								);
							})}
							<TableRow>
								<TableCell />
							</TableRow>
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>
			<Box className='col'>
				<EntityView registry={registry} entity={viewedEntity} client={client} />
				<Console registry={registry} />
			</Box>
		</Box>
	);
}