import * as THREE from 'three';	
import Log from './Log';
export function isBrowser () {
	  return typeof window !== 'undefined';
}
export default function ({ registry, scene }) {
	const system = {
		pathsToTextures: {},
		pathsToMaterials: {},
		entitiesToThree: {},
		threeToEntities: {},
		onEmplace: function (entity, component) {
			Log.debug("SpriteRenderer.onLoad", { entity, component })
			const position = registry.getOrEmplace({ type: "Position", entity })
			const { path } = component
			let texture
			let material
			if (isBrowser())
			if (this.pathsToTextures[path]) {
				texture = this.pathsToTextures[path]
				material = this.pathsToMaterials[path]
			} else {
				texture = new THREE.TextureLoader().load(`sprites/${path}`)
				texture.colorSpace = THREE.SRGBColorSpace
				texture.magFilter = THREE.NearestFilter
				texture.minFilter = THREE.NearestFilter
				this.pathsToTextures[path] = texture
				material = new THREE.SpriteMaterial({ map: texture });
				this.pathsToMaterials[path] = material
			}
			const sprite = new THREE.Sprite(material);
			sprite.position.set(position.x, position.y, position.z)
			this.entitiesToThree[entity] = sprite.id
			this.threeToEntities[sprite.id] = entity
			scene.add(sprite)
		},
		getEntityFromThree: function (id) {

			return this.threeToEntities[id]
		},
		getThreeFromEntity: function (entity) {
			return this.entitiesToThree[entity]
		},
		onErase: function (entity) {
			Log.debug("SpriteRenderer.onErase", { entity })
			const mesh = this.entitiesToThree[entity]
			scene.remove(this.entitiesToThree[entity])
			delete this.entitiesToThree[entity]
			delete this.threeToEntities[mesh]
		},
		onRender() {
			registry.each({
				types: ["Sprite"],
				callback: (entity) => {
					if (this.entitiesToThree[entity] === undefined) {
						this.onEmplace({ entity, component: registry.get({ type: "Sprite", entity }) })
					}
					// const position = registry.get({ type: "Position", entity })
					// registry.replace({ type: "Position", entity, component: position })
					// this.entitiesToMeshes[entity].position.set(position.x, position.y, position.z)
				}
			})
		}
	}
	const observers = [
		// registry.onEmplace({type: "Sprite"}).connect(system.onEmplace.bind(system)),
		// registry.onErase({type: "Sprite"}).connect(system.onErase.bind(system))
		registry.onEmplace("Sprite").connect(system.onEmplace.bind(system)),
		registry.onErase("Sprite").connect(system.onErase.bind(system))
	]
	// deconstruct
	system.deconstruct = () => {
		for (let observer of observers) {
			observer.disconnect()
		}
	}
	return system
}