import { LocalNotes } from '../services/local-notes';
import { RemoteNoteCaches } from '../services/remote-notes';

export type HttpServerState = {
	localNotes: LocalNotes;
	remoteNoteCaches: RemoteNoteCaches;
};
