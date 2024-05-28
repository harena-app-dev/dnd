
import WebSocketMessager from "./WebSocketMessager";
import ServerRegistry from "../ServerRegistry";
import ExpressMessager from "./ExpressMessager";
import SpriteRenderer from "../systems/SpriteRender";
import Server from "../systems/Server";
import * as THREE from "three";
// export const wsm = WebSocketMessager({ port: 3001 });
// export const em = ExpressMessager({ port: 3002 });
export const registry = ServerRegistry();

const serverSystem = Server({ registry });
// registry.connect({ wsm, isClient: false, em });
const scene = new THREE.Scene();
const spriteRenderer = SpriteRenderer({ registry, scene });

function tick() {
	spriteRenderer.onRender(); 
}
setInterval(tick, 1000 / 60);