import { RemoteNote } from './note';
import { RemoteNoteCaches } from './remote-notes';

export class NoteFetcher {
	caches: RemoteNoteCaches;

	constructor(caches: RemoteNoteCaches) {
		this.caches = caches;
	}

	fetch(serverId: string, noteId: string) {
		const cache = this.caches.find(serverId, noteId);
		if (!cache.error) {
			return cache;
		}
		return cache;
		// TODO
		// const note = {} as RemoteNote;
		// this.caches.update({
		// 	id: note.id,
		// 	serverId: note.serverId,
		// 	text: note.text
		// });
		// return note;
	}
}
