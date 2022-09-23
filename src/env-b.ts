import { run } from './http-server';
import { LocalNotes } from './notes/local-notes';
import { RemoteNoteCaches } from './notes/remote-notes';

const localNotes = new LocalNotes();
const remoteNoteCaches = new RemoteNoteCaches();

const state = {
	listenPort: 3001,
	localNotes: localNotes,
	remoteNoteCaches: remoteNoteCaches,
};
run(state);
