// import fs from 'fs';
// import path from 'path';
import * as Components from './components/index.auto.js';
export function Observable() {
	return {
		observers: new Set(),
		connect(callback) {
			this.observers.add(callback);
		},
		disconnect(callback) {
			this.observers.delete(callback);
		},
		notify(args) {
			this.observers.forEach(callback => callback(args));
		}
	}
}
export function addFunctionObservables({ parent, name }) {
	// add pre and post observables	
	const preObservable = Observable();
	const postObservable = Observable();
	const f = parent[name];
	parent[name] = (...args) => {
		preObservable.notify({ args });
		const result = f(...args);
		postObservable.notify({ args, result });
		return result;
	};
	parent[`onPre${name[0].toUpperCase()}${name.slice(1)}`] = preObservable;
	parent[`onPost${name[0].toUpperCase()}${name.slice(1)}`] = postObservable;
}
export function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}
export function Registry() {
	const registry = {
		entitySet: [],
		destroyedSet: [],
		typesToEntitiesToComponents: {},
		typesToConstructors: {},
		entitiesToTypes: {},
		onCreate: Observable(),
		onEmplace: {},
		onDestroy: Observable(),
		unsynced: new Set(['onCreate', 'onDestroy', 'typesToConstructors', 'onEmplace', 'unsynced']),
		size() {
			return this.entitySet.length;
		},
		getTypes({ entity }) {
			return this.entitiesToTypes[entity];
		},
		getSingleton({ type }) {
			const entities = this.typesToEntitiesToComponents[type];
			if (entities === undefined) {
				console.error(`no entities of type ${type}`);
			}
			if (Object.keys(entities).length !== 1) {
				console.error(`expected exactly one entity of type ${type}`);
			}
			const entity = Object.keys(entities)[0];
			return this.get({ type, entity });
		},
		create() {
			let entity;
			if (this.destroyedSet.length > 0) {
				entity = this.destroyedSet.pop();
			} else {
				entity = this.entitySet.length;
			}
			this.entitySet.push(entity);
			this.entitiesToTypes[entity] = [];
			this.onCreate.notify({ entity });
			return entity;
		},
		emplace({ type, entity, component }) {
			if (!this.typesToEntitiesToComponents[type]) {
				this.typesToEntitiesToComponents[type] = {};
			}
			this.typesToEntitiesToComponents[type][entity] = component;
			if (this.entitiesToTypes[entity].includes(type)) {
				console.error(`entity ${entity} already has component of type ${type}`);
			} 
			this.entitiesToTypes[entity].push(type);
			this.onEmplace[type].notify({ entity, component });
			return component;
		},
		destroy({ entity }) {
			if (!this.valid(entity)) {
				console.error(`entity ${entity} does not exist`);
				return;
			}
			this.onDestroy.notify({ entity });
			const index = this.entitySet.indexOf(entity);
			this.entitySet.splice(index, 1);
			this.destroyedSet.push(entity);
		},
		has({ type, entity }) {
			return this.typesToEntitiesToComponents[type] !== undefined && this.typesToEntitiesToComponents[type][entity] !== undefined;
		},
		get({ type, entity }) {
			return this.typesToEntitiesToComponents[type][entity];
		},
		valid({ entity }) {
			return this.entitySet.includes(entity);
		},
		each({ types, callback }) {
			if (types === undefined) {
				for (let entity of this.entitySet) {
					callback({ entity });
				}
				return;
			}
			const entitySets = types.map(type => this.typesToEntitiesToComponents[type]);
			const intersection = Object.keys(entitySets[0]);
			for (let i = 1; i < entitySets.length; i++) {
				const entitySet = entitySets[i];
				for (let entity of intersection) {
					if (entitySet[entity] === undefined) {
						delete intersection[entity];
					}
				}
			}
			for (let entity of intersection) {
				callback({ entity });
			}
		},
		map({ types, callback }) {
			const result = [];
			this.each({
				types, callback: ({ entity }) => {
					result.push(callback({ entity }));
				}
			});
			return result;
		}
	};
	for (let [name, component] of Object.entries(Components)) {
		registry.typesToConstructors[name] = component;
		registry.onEmplace[name] = Observable();
	}
	return registry;
}