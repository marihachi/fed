import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { LocalNotes } from '../notes/local-notes';
import { RemoteNoteCaches } from '../notes/remote-notes';
import notesFedRouter from './fed-router';
import notesRouter from './note-router';
import { HttpServerState } from './server-state';

export function run(state: {
	listenPort: number;
	localNotes: LocalNotes;
	remoteNoteCaches: RemoteNoteCaches;
	serverId: string;
}) {
	const app = new Koa();

	app.use(bodyParser());
	app.use<HttpServerState>(async (ctx, next) => {
		ctx.state.localNotes = state.localNotes;
		ctx.state.remoteNoteCaches = state.remoteNoteCaches;
		ctx.state.serverId = state.serverId;
		await next();
	});
	app.use(notesFedRouter());
	app.use(notesRouter());

	app.listen(state.listenPort, () => {
		console.log(`Listening started: http://localhost:${state.listenPort}/`);
	});
}
