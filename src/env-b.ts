import { run } from './server';
import { LocalNotes } from './services/local-notes';
import { RemoteNoteCaches } from './services/remote-notes';

const localNotes = new LocalNotes();
const remoteNoteCaches = new RemoteNoteCaches();

const state = {
	listenPort: 3001,
	localNotes: localNotes,
	remoteNoteCaches: remoteNoteCaches,
};
run(state);
