import { LocalNotes } from './services/notes/local-notes';
import { RemoteNoteCaches } from './services/notes/remote-notes';
import { run } from './services/server';

const localNotes = new LocalNotes();
const remoteNoteCaches = new RemoteNoteCaches();

const state = {
	listenPort: 3001,
	localNotes: localNotes,
	remoteNoteCaches: remoteNoteCaches,
	serverId: 'b',
};
run(state);
