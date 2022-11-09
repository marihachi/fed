import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { LocalNotes } from '../services/local-notes';
import { RemoteNoteCaches } from '../services/remote-notes';
import notesFedRouter from './routers/fed-router';
import notesRouter from './routers/note-router';
import { HttpServerState } from './server-state';

export function run(state: { listenPort: number; localNotes: LocalNotes; remoteNoteCaches: RemoteNoteCaches; }) {
	const app = new Koa();

	app.use(bodyParser());
	app.use<HttpServerState>(async (ctx, next) => {
		ctx.state.localNotes = state.localNotes;
		ctx.state.remoteNoteCaches = state.remoteNoteCaches;
		await next();
	});
	app.use(notesFedRouter());
	app.use(notesRouter());

	app.listen(state.listenPort, () => {
		console.log(`Listening started: http://localhost:${state.listenPort}/`);
	});
}
