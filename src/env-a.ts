import { run } from './http-server';
import { RemoteNote } from './notes/note';

const noteCache: Map<string, RemoteNote> = new Map();

const state = {
	listenPort: 3000,
	noteCache: noteCache,
};
run(state);
