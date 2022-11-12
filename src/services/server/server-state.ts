import { LocalNotes } from '../notes/local-notes';
import { RemoteNoteCaches } from '../notes/remote-notes';

export type HttpServerState = {
	localNotes: LocalNotes;
	remoteNoteCaches: RemoteNoteCaches;
	serverId: string;
};
