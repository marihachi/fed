import { run } from './http-server';
import { RemoteNote } from './notes/note';

const remoteNoteCache: Map<string, RemoteNote> = new Map();

const state = {
	listenPort: 3000,
	remoteNoteCache: remoteNoteCache,
};
run(state);
