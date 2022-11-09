import { v4 as uuid } from 'uuid';
import { LocalNote } from '../models/note';

export class LocalNotes {
	notes: LocalNote[];

	constructor() {
		this.notes = [];
	}

	create(param: { text: string }): LocalNote {
		const noteId = uuid();
		const index = this.notes.findIndex(x => x.id == noteId);
		if (index != -1) {
			throw new Error('resource-id-duplicated');
		}
		const note: LocalNote = {
			id: noteId,
			text: param.text,
		};
		this.notes.push(note);
		return note;
	}

	find(noteId: string): LocalNote {
		const index = this.notes.findIndex(x => x.id == noteId);
		if (index == -1) {
			throw new Error('not-found');
		}
		return this.notes[index];
	}

	delete(noteId: string): void {
		const index = this.notes.findIndex(x => x.id == noteId);
		if (index == -1) {
			throw new Error('not-found');
		}
		this.notes.splice(index, 1);
	}
}
