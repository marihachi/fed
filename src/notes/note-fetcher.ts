import { Note } from "./note";

function buildKey(serverId: string, noteId: string) {
	const espacedServerId = serverId.replace('/', '\\/');
	const espacedNoteId = noteId.replace('/', '\\/');
	return `${espacedServerId}/${espacedNoteId}`;
}

export class FetchError {
	reason: string;

	constructor(reason: string) {
		this.reason = reason;
	}
}

export class NoteFetcher {
	cache: Map<string, Note>;

	constructor() {
		this.cache = new Map();
	}

	fetch(serverId: string, noteId: string): Note | FetchError {
		const key = buildKey(serverId, noteId);
		if (this.cache.has(key)) {
			return this.cache.get(key)!;
		}
		return new FetchError('not-found');
		// TODO
		// const note = {} as Note;
		// this.cache.set(key, note);
		// return note;
	}
}
