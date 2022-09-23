import { RemoteNote } from './note';

export function buildKey(serverId: string, noteId: string) {
	const espacedServerId = serverId
		.replace('\\', '\\\\')
		.replace('/', '\\/');
	const espacedNoteId = noteId
		.replace('\\', '\\\\')
		.replace('/', '\\/');
	return `${espacedServerId}/${espacedNoteId}`;
}

export class FetchError {
	reason: string;

	constructor(reason: string) {
		this.reason = reason;
	}
}

export class NoteFetcher {
	cache: Map<string, RemoteNote>;

	constructor(catche: Map<string, RemoteNote>) {
		this.cache = catche;
	}

	fetch(serverId: string, noteId: string): RemoteNote | FetchError {
		const key = buildKey(serverId, noteId);
		if (this.cache.has(key)) {
			return this.cache.get(key)!;
		}
		return new FetchError('not-found');
		// TODO
		// const note = {} as RemoteNote;
		// this.cache.set(key, note);
		// return note;
	}
}
