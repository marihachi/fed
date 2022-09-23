import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import NotesRouter from '../notes/notes-router';

export function run(opts: { listenPort: number; }) {
	const app = new Koa();
	app.use(bodyParser());
	app.use(NotesRouter());

	app.listen(opts.listenPort, () => {
		console.log(`Listening started: http://localhost:${opts.listenPort}/`);
	});
}
