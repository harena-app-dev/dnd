export function createRegistry() {
	return {
		entitySet: {},
		entityIdCounter: 0,
		componentPools: {},
		size() {
			return Object.keys(this.entitySet).length;
		},
		create() {
			const entity = this.entityIdCounter++;
			this.entitySet[entity] = {};
			return entity;
		},
		emplace({ type, entity, component }) {
			if (!this.componentPools[type]) {
				this.componentPools[type] = {};
			}
			this.componentPools[type][entity] = component;
		},
		destroy({entity}) {
			delete this.entitySet[entity];
		},
		get({ type, entity }) {
			return this.componentPools[type][entity];
		},
		each({ types, callback }) {
			if (types===undefined) {
				for (let entity in this.entitySet) {
					callback({entity});
				}
			}
		},
		map({ types, callback }) {
			const result = [];
			this.each({ types, callback: ({entity}) => {
				result.push(callback({entity}));
			}});
			return result;
		}
	};
}