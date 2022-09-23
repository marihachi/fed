import { RemoteNote } from './note';
import { buildKey } from './resource-key';

export class RemoteNoteCaches {
	cache: Map<string, RemoteNote>;

	constructor() {
		this.cache = new Map();
	}

	update(param: { id: string, text: string, serverId: string }) {
		const key = buildKey(param.serverId, param.id);
		const note: RemoteNote = {
			id: param.id,
			text: param.text,
			serverId: param.serverId,
		};
		this.cache.set(key, note);
		return { result: note };
	}

	find(serverId: string, noteId: string) {
		const key = buildKey(serverId, noteId);
		if (!this.cache.has(key)) {
			return { error: 'not-found' as const };
		}
		return { result: this.cache.get(key)! };
	}

	delete(serverId: string, noteId: string) {
		
		const key = buildKey(serverId, noteId);
		if (!this.cache.has(key)) {
			return { error: 'not-found' as const };
		}
		this.cache.delete(key);

		return { result: true };
	}
}
