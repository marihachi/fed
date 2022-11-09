import Router from '@koa/router';
import { Type } from '@sinclair/typebox';
import Ajv from 'ajv';
import { LocalNote, RemoteNote } from '../../models/note';
import { HttpServerState } from '../server-state';
import { ResponseBuilder } from '../services/response-builder';

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

		let note: LocalNote;
		try {
			note = ctx.state.localNotes.find(id);
		}
		catch (err) {
			builder.error(404, 'not-found');
			return;
		}

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
			builder.error(400, 'invalid-params');
			return;
		}
		const body = ctx.request.body;

		let note: RemoteNote;
		try {
			note = ctx.state.remoteNoteCaches.update({
				id: body.id,
				text: body.text,
				serverId: serverId,
			});
		}
		catch (err) {
			builder.error(500, 'internal-error');
			return;
		}

		builder.success(200, note);
	});

	// incoming: delete resource event (need server-authentication)
	router.delete('/remote/notes/:id', async (ctx) => {
		const builder = new ResponseBuilder(ctx);
		const serverId = 'b'; // TODO: authentication
		const id = ctx.params.id;

		try {
			ctx.state.remoteNoteCaches.delete(serverId, id);
		}
		catch (err) {
			builder.success(200, { deleted: false });
			return;
		}

		builder.success(200, { deleted: true });
	});

	return router.routes();
}
