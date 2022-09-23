import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import notesFedRouter from '../notes/fed-router';
import { LocalNotes } from '../notes/local-notes';
import { RemoteNoteCaches } from '../notes/remote-notes';
import notesRouter from '../notes/router';

export type HttpServerState = {
	localNotes: LocalNotes;
	remoteNoteCaches: RemoteNoteCaches;
};

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
