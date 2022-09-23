import Router from '@koa/router';
import Ajv from 'ajv';
import { Type } from '@sinclair/typebox';
import { v4 as uuid } from 'uuid';
import { Note } from './note';
import { ResponseBuilder } from '../http/response-builder';
import { FetchError, NoteFetcher } from './note-fetcher';

// <client APIs>
// POST   /notes
// GET    /notes/:target
// DELETE /notes/:id

// <server APIs>
// GET    /local/notes/:id
// POST   /remote/notes
// DELETE /remote/notes/:id

export default function() {
	const router = new Router();
	const notes: Note[] = [];
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
		const index = notes.findIndex(x => x.id == noteId && x.serverId == null);
		if (index != -1) {
			return builder.error(400, 'resource-already-exists');
		}
		const note: Note = {
			id: noteId,
			text: body.text,
		};
		notes.push(note);

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
		const index = notes.findIndex(x => x.id == name && x.serverId == server);
		if (index != -1) {
			return builder.success(200, {
				id: notes[index].id,
				text: notes[index].text,
				serverId: notes[index].serverId,
			});
		}
		if (server == null) {
			return builder.error(404, 'not-found');
		}
		const fetcher = new NoteFetcher();
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

		const index = notes.findIndex(x => x.id == id && x.serverId == null);
		if (index == -1) {
			return builder.error(404, 'not-found');
		}
		notes.splice(index, 1);

		builder.success(200, { deleted: true });
	});

	// outgoing: fetch a resource in local server (need server-authentication)
	router.get('/local/notes/:id', async (ctx) => {
		const builder = new ResponseBuilder(ctx);
		//const signature = ctx.request.header.signature;
		const serverId = 'b'; // TODO: authentication
		const id = ctx.params.id;

		const index = notes.findIndex(x => x.id == id && x.serverId == null);
		if (index == -1) {
			return builder.error(404, 'not-found');
		}

		builder.success(200, {
			id: notes[index].id,
			text: notes[index].text,
		});
	});

	const remoteNoteUpdateSchema = Type.Object({
		id: Type.String(),
		text: Type.String(),
	});

	// incoming: update resource event (need server-authentication)
	router.post('/remote/notes', async (ctx) => {
		const builder = new ResponseBuilder(ctx);
		const serverId = 'b'; // TODO: authentication

		if (!ajv.validate(remoteNoteUpdateSchema, ctx.request.body)) {
			return builder.error(400, 'invalid-params');
		}
		const body = ctx.request.body;

		const index = notes.findIndex(x => x.id == body.id && x.serverId == serverId);
		const note: Note = {
			id: body.id,
			text: body.text,
			serverId: serverId,
		};
		if (index == -1) {
			notes.push(note);
		}
		else {
			notes[index] = note;
		}

		builder.success(200, note);
	});

	// incoming: delete resource event (need server-authentication)
	router.delete('/remote/notes/:id', async (ctx) => {
		const builder = new ResponseBuilder(ctx);
		const serverId = 'b'; // TODO: authentication
		const id = ctx.params.id;

		const index = notes.findIndex(x => x.id == id && x.serverId == serverId);
		if (index == -1) {
			return builder.error(404, 'not-found');
		}
		notes.splice(index, 1);

		builder.success(200, { deleted: true });
	});

	return router.routes();
}
