import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import notesFedRouter from '../notes/fed-router';
import { RemoteNote } from '../notes/note';
import notesRouter from '../notes/router';

export type HttpServerState = {
	noteCache: Map<string, RemoteNote>;
};

export function run(state: { listenPort: number; noteCache: Map<string, RemoteNote>; }) {
	const app = new Koa();

	app.use(bodyParser());
	app.use<HttpServerState>(async (ctx, next) => {
		ctx.state.noteCache = state.noteCache;
		await next();
	});
	app.use(notesFedRouter());
	app.use(notesRouter());

	app.listen(state.listenPort, () => {
		console.log(`Listening started: http://localhost:${state.listenPort}/`);
	});
}
