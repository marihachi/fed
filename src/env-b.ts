import { run } from './http-server';
import { RemoteNote } from './notes/note';

const noteCache: Map<string, RemoteNote> = new Map();

const state = {
	listenPort: 3001,
	noteCache: noteCache,
};
run(state);
