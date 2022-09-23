import Router from '@koa/router';
import Ajv from 'ajv';
import { Type } from '@sinclair/typebox';
import { HttpServerState } from '../http-server';
import { ResponseBuilder } from '../http-server/response-builder';
import { LocalNote, RemoteNote } from './note';

// GET    /local/notes/:id
// POST   /remote/notes
// DELETE /remote/notes/:id

export default function() {
	const router = new Router<HttpServerState>();
	const ajv = new Ajv();

	// outgoing: fetch a resource from local server (need server-authentication)
	router.get('/local/notes/:id', async (ctx) => {
		const builder = new ResponseBuilder(ctx);
		//const signature = ctx.request.header.signature;
		const serverId = 'b'; // TODO: authentication
		const id = ctx.params.id;

		const result = ctx.state.localNotes.find(id);
		if (result.error) {
			return builder.error(404, 'not-found');
		}
		const note: LocalNote = result.result;

		builder.success(200, note);
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

		const updateResult = ctx.state.remoteNoteCaches.update({
			id: body.id,
			text: body.text,
			serverId: serverId,
		});
		const note: RemoteNote = updateResult.result;

		builder.success(200, note);
	});

	// incoming: delete resource event (need server-authentication)
	router.delete('/remote/notes/:id', async (ctx) => {
		const builder = new ResponseBuilder(ctx);
		const serverId = 'b'; // TODO: authentication
		const id = ctx.params.id;

		const result = ctx.state.remoteNoteCaches.delete(serverId, id);
		if (result.error) {
			return builder.success(200, { deleted: false });
		}

		builder.success(200, { deleted: true });
	});

	return router.routes();
}
