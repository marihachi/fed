import { buildKey } from '../resource-key';
import { RemoteNote } from './note';

export class RemoteNoteCaches {
	cache: Map<string, RemoteNote>;

	constructor() {
		this.cache = new Map();
	}

	update(param: { id: string, text: string, serverId: string }): RemoteNote {
		const key = buildKey(param.serverId, param.id);
		const note: RemoteNote = {
			id: param.id,
			text: param.text,
			serverId: param.serverId,
		};
		this.cache.set(key, note);
		return note;
	}

	find(serverId: string, noteId: string): RemoteNote {
		const key = buildKey(serverId, noteId);
		if (!this.cache.has(key)) {
			throw new Error('not-found');
		}
		return this.cache.get(key)!;
	}

	delete(serverId: string, noteId: string): void {
		const key = buildKey(serverId, noteId);
		if (!this.cache.has(key)) {
			throw new Error('not-found');
		}
		this.cache.delete(key);
	}
}
