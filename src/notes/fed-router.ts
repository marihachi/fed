import Router from '@koa/router';
import Ajv from 'ajv';
import { Type } from '@sinclair/typebox';
import { v4 as uuid } from 'uuid';
import { LocalNote, RemoteNote } from './note';
import { ResponseBuilder } from '../http-server/response-builder';
import { HttpServerState } from '../http-server';
import { buildKey } from './resource-key';

// GET    /local/notes/:id
// POST   /remote/notes
// DELETE /remote/notes/:id

export default function() {
	const router = new Router<HttpServerState>();
	const notes: LocalNote[] = [];
	const ajv = new Ajv();

	// outgoing: fetch a resource from local server (need server-authentication)
	router.get('/local/notes/:id', async (ctx) => {
		const builder = new ResponseBuilder(ctx);
		//const signature = ctx.request.header.signature;
		const serverId = 'b'; // TODO: authentication
		const id = ctx.params.id;
		ctx.state

		const index = notes.findIndex(x => x.id == id);
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

		const key = buildKey(serverId, body.id);
		const note: RemoteNote = {
			id: body.id,
			text: body.text,
			serverId: serverId,
		};
		ctx.state.noteCache.set(key, note);

		builder.success(200, note);
	});

	// incoming: delete resource event (need server-authentication)
	router.delete('/remote/notes/:id', async (ctx) => {
		const builder = new ResponseBuilder(ctx);
		const serverId = 'b'; // TODO: authentication
		const id = ctx.params.id;

		const key = buildKey(serverId, id);
		if (!ctx.state.noteCache.has(key)) {
			return builder.success(200, { deleted: false });
		}
		ctx.state.noteCache.delete(key);

		builder.success(200, { deleted: true });
	});

	return router.routes();
}
