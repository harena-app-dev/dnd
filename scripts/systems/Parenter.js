import Log from '../log';
import * as THREE from 'three';
import { nullEntity } from '../Core';
export default function (registry, systems) {
	registry.onEmplace({type: 'Parent', callback: (entity) => {
		const parent = registry.get({ entity, type: 'Parent' });
		if (parent.entity === nullEntity) {
			return;
		}
		const externalProxy = registry.get({ entity, type: 'ExternalProxy' });
		const parentExternalProxy = registry.get({ entity: parent.entity, type: 'ExternalProxy' });
		const proxy = scene.getObjectById(externalProxy.threeId);
		const parentProxy = scene.getObjectById(parentExternalProxy.threeId);
		parentProxy.add(proxy);
	}});
}