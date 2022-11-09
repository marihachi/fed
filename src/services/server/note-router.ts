import Router from '@koa/router';
import { Type } from '@sinclair/typebox';
import Ajv from 'ajv';
import { LocalNote, RemoteNote } from '../notes/note';
import { NoteFetcher } from '../notes/note-fetcher';
import { ResponseBuilder } from './response-builder';
import { HttpServerState } from './server-state';

// POST   /notes
// GET    /notes/:target
// DELETE /notes/:id

export default function() {
	const router = new Router<HttpServerState>();
	const ajv = new Ajv();

	const localNoteUpdateSchema = Type.Object({
		text: Type.String(),
	});

	// create a resource
	router.post('/notes', async (ctx) => {
		const builder = new ResponseBuilder(ctx);

		if (!ajv.validate(localNoteUpdateSchema, ctx.request.body)) {
			builder.error(400, 'invalid-params');
			return;
		}
		const body = ctx.request.body;

		let note: LocalNote;
		try {
			note = ctx.state.localNotes.create({
				text: body.text,
			});
		}
		catch (err) {
			builder.error(500, 'internal-error');
			return;
		}

		builder.success(200, note);
	});

	// get a resource
	router.get('/notes/:target', async (ctx) => {
		const builder = new ResponseBuilder(ctx);
		const target = ctx.params.target;
		let match = /^([^@]+)@([^@]+)$/.exec(target);
		if (match != null) {
			const noteId = match[1];
			const serverId = match[2];
			const fetcher = new NoteFetcher(ctx.state.remoteNoteCaches);

			let fetchedNote: RemoteNote;
			try {
				fetchedNote = fetcher.fetch(serverId, noteId);
			}
			catch (err) {
				builder.error(404, 'not-found');
				return;
			}

			builder.success(200, fetchedNote);
		}
		else {
			const noteId = target;

			let note: LocalNote;
			try {
				note = ctx.state.localNotes.find(noteId);
			}
			catch (err) {
				builder.error(404, 'not-found');
				return;
			}

			builder.success(200, note);
		}
	});

	// delete a resource
	router.delete('/notes/:id', async (ctx) => {
		const builder = new ResponseBuilder(ctx);
		const id = ctx.params.id;

		try {
			ctx.state.localNotes.delete(id);
		}
		catch (err) {
			builder.error(404, 'not-found');
			return;
		}

		builder.success(200, { deleted: true });
	});

	return router.routes();
}
