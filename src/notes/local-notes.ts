import { v4 as uuid } from 'uuid';
import { LocalNote } from './note';

export class LocalNotes {
	notes: LocalNote[];

	constructor() {
		this.notes = [];
	}

	create(param: { text: string }) {
		const noteId = uuid();
		const index = this.notes.findIndex(x => x.id == noteId);
		if (index != -1) {
			return { error: 'resource-id-duplicated' as const };
		}
		const note: LocalNote = {
			id: noteId,
			text: param.text,
		};
		this.notes.push(note);

		return { result: note };
	}

	find(noteId: string) {
		const index = this.notes.findIndex(x => x.id == noteId);
		if (index == -1) {
			return { error: 'not-found' as const };
		}
		return { result: this.notes[index] };
	}

	delete(noteId: string) {
		const index = this.notes.findIndex(x => x.id == noteId);
		if (index == -1) {
			return { error: 'not-found' as const };
		}
		this.notes.splice(index, 1);
		return { result: true };
	}
}
