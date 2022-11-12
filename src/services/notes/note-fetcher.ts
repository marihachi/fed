import Axios from 'axios';
import Ajv from 'ajv';
import { RemoteNote, remoteNoteSchema } from './note';
import { RemoteNoteCaches } from './remote-notes';

export class NoteFetcher {
	caches: RemoteNoteCaches;
	ajv: Ajv;

	constructor(caches: RemoteNoteCaches) {
		this.caches = caches;
		this.ajv = new Ajv();
	}

	async fetch(serverId: string, noteId: string): Promise<RemoteNote> {
		// check cache
		let cache: RemoteNote;
		try {
			cache = this.caches.find(serverId, noteId);
			return cache;
		}
		catch (err) {
		}

		// TODO: build the base url and path
		const baseUrl = serverId == 'a' ? 'http://localhost:3000' : 'http://localhost:3001';
		const path = `/local/notes/${noteId}`;

		// fetch resource
		let res;
		try {
			res = await Axios.get(`${baseUrl}${path}`);
		}
		catch (err) {
			//console.error(err.message);
			throw new Error('fetch-failed');
		}

		// validate resource
		if (!this.ajv.validate(remoteNoteSchema, res.data)) {
			//console.log(res.data);
			throw new Error('invalid-data');
		}
		const note: RemoteNote = res.data;

		// update cache
		this.caches.update(note);

		return note;
	}
}
