import { nullEntity } from '@/scripts/Registry.js';
import Log from '../../Log.js';
export default function (registry, systems) {
	this._playerEntity = nullEntity;
	this.tick = function () {
		Log.info('Player.tick', this._playerEntity);
		if (!registry.valid(this._playerEntity)) {
			return;
		}
		const keyboard = systems.get('Keyboard');
		const x = keyboard.isKeyDown('d') - keyboard.isKeyDown('a');
		const z = keyboard.isKeyDown('s') - keyboard.isKeyDown('w');
		const position = registry.get('Position', this._playerEntity);
		position.x += x * 0.1;
		position.z += z * 0.1;
		registry.replace('Position', this._playerEntity, position);
		Log.info('player', position);

	}
	const client = systems.get('Client');

	this.destructor = function () {
		Log.info('Player.destructor');
		if (registry.valid(this._playerEntity)) {
			client.promiseDestroy(this._playerEntity);
		}
	}
	client.promiseCreate().then((entity) => {
		Log.info('promiseCreate', entity);

		// client.promiseEmplace({ entity, type: 'Spawner' });
		client.promiseEmplace("Sprite", entity, { path: "rogue.png" }).then(() => {
			this._playerEntity = entity;
		})
	});
}