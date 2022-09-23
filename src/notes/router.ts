import Router from '@koa/router';
import Ajv from 'ajv';
import { Type } from '@sinclair/typebox';
import { HttpServerState } from '../http-server';
import { ResponseBuilder } from '../http-server/response-builder';
import { LocalNote, RemoteNote } from './note';
import { NoteFetcher } from './note-fetcher';

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
			return builder.error(400, 'invalid-params');
		}
		const body = ctx.request.body;

		const result = ctx.state.localNotes.create({
			text: body.text,
		});
		if (result.error) {
			return builder.error(500, 'internal-error');
		}
		const note: LocalNote = result.result;

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
			const fetchResult = fetcher.fetch(serverId, noteId);
			if (fetchResult.error) {
				return builder.error(404, 'not-found');
			}
			const note: RemoteNote = fetchResult.result;

			return builder.success(200, note);
		}
		else {
			const noteId = target;

			const result = ctx.state.localNotes.find(noteId);
			if (result.error) {
				return builder.error(404, 'not-found');
			}
			const note: LocalNote = result.result;

			return builder.success(200, note);
		}
	});

	// delete a resource
	router.delete('/notes/:id', async (ctx) => {
		const builder = new ResponseBuilder(ctx);
		const id = ctx.params.id;

		const result = ctx.state.localNotes.delete(id);
		if (result.error) {
			return builder.error(404, 'not-found');
		}

		builder.success(200, { deleted: true });
	});

	return router.routes();
}
