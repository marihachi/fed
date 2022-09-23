import Router from '@koa/router';
import Ajv from 'ajv';
import { Type } from '@sinclair/typebox';
import { v4 as uuid } from 'uuid';
import { LocalNote } from './note';
import { ResponseBuilder } from '../http-server/response-builder';
import { FetchError, NoteFetcher } from './note-fetcher';
import { HttpServerState } from '../http-server';

// POST   /notes
// GET    /notes/:target
// DELETE /notes/:id

export default function() {
	const router = new Router<HttpServerState>();
	const localNotes: LocalNote[] = [];
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

		const noteId = uuid();
		const index = localNotes.findIndex(x => x.id == noteId);
		if (index != -1) {
			return builder.error(400, 'resource-already-exists');
		}
		const note: LocalNote = {
			id: noteId,
			text: body.text,
		};
		localNotes.push(note);

		builder.success(200, note);
	});

	// get a resource
	router.get('/notes/:target', async (ctx) => {
		const builder = new ResponseBuilder(ctx);
		const target = ctx.params.target;

		let server: string | undefined, name: string;
		let match = /^([^@]+)@([^@]+)$/.exec(target);
		if (match != null) {
			name = match[1];
			server = match[2];
		}
		else {
			name = target;
		}
		const index = localNotes.findIndex(x => x.id == name);
		if (index != -1) {
			return builder.success(200, localNotes[index]);
		}
		if (server == null) {
			return builder.error(404, 'not-found');
		}
		const fetcher = new NoteFetcher(ctx.state.remoteNoteCache);
		const fetchResult = fetcher.fetch(server, name);
		if (fetchResult instanceof FetchError) {
			return builder.error(404, 'not-found');
		}
		return fetchResult;
	});

	// delete a resource
	router.delete('/notes/:id', async (ctx) => {
		const builder = new ResponseBuilder(ctx);
		const id = ctx.params.id;

		const index = localNotes.findIndex(x => x.id == id);
		if (index == -1) {
			return builder.error(404, 'not-found');
		}
		localNotes.splice(index, 1);

		builder.success(200, { deleted: true });
	});

	return router.routes();
}
