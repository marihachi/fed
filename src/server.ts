import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import NotesRouter from './routes/notes';

export function run(opts: { listenPort: number; }) {
	const app = new Koa();

	app.use(bodyParser());
	app.use(NotesRouter());

	app.listen(opts.listenPort, () => {
		console.log(`Listening started: http://localhost:${opts.listenPort}/`);
	});
}
