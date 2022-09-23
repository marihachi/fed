import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import notesFedRouter from '../notes/fed-router';
import { RemoteNote } from '../notes/note';
import notesRouter from '../notes/router';

export type HttpServerState = {
	remoteNoteCache: Map<string, RemoteNote>;
};

export function run(state: { listenPort: number; remoteNoteCache: Map<string, RemoteNote>; }) {
	const app = new Koa();

	app.use(bodyParser());
	app.use<HttpServerState>(async (ctx, next) => {
		ctx.state.remoteNoteCache = state.remoteNoteCache;
		await next();
	});
	app.use(notesFedRouter());
	app.use(notesRouter());

	app.listen(state.listenPort, () => {
		console.log(`Listening started: http://localhost:${state.listenPort}/`);
	});
}
