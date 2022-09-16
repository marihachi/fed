import Router from '@koa/router';
import Ajv from 'ajv';
import { Static, Type } from '@sinclair/typebox';

// <client APIs>
// POST   /notes
// GET    /notes/:target
// DELETE /notes/:id

// <server APIs>
// GET    /local/notes/:id
// POST   /remote/notes
// DELETE /remote/notes/:id

type Note = {
	id: string,
	text: string,
	serverId?: string;
};

export default function() {
	const router = new Router();
	const notes: Note[] = [];
	const ajv = new Ajv();

	// create a resource
	const localNoteUpdateSchema = Type.Object({
		id: Type.String(),
		text: Type.String(),
	});
	router.post('/notes', async (ctx, next) => {
		if (!ajv.validate(localNoteUpdateSchema, ctx.request.body)) {
			ctx.body = { error: 'invalid-params' };
			ctx.status = 400;
			return;
		}
		const body = ctx.request.body as Static<typeof localNoteUpdateSchema>;

		const index = notes.findIndex(x => x.id == body.id && x.serverId == null);
		if (index != -1) {
			ctx.body = { error: 'resource-already-exists' };
			ctx.status = 400;
			return;
		}
		const note: Note = {
			id: body.id,
			text: body.text,
		};
		notes.push(note);

		ctx.body = note;
		ctx.status = 200;
	});

	// get a resource
	router.get('/notes/:target', async (ctx, next) => {
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
		if (index == -1) {
			return await next();
		}

		ctx.body = {
			id: notes[index].id,
			text: notes[index].text,
			serverId: notes[index].serverId,
		};
		ctx.status = 200;
	});

	// delete a resource
	router.delete('/notes/:id', async (ctx, next) => {
		const id = ctx.params.id;

		const index = notes.findIndex(x => x.id == id && x.serverId == null);
		if (index == -1) {
			return await next();
		}
		notes.splice(index, 1);

		ctx.body = { deleted: true };
		ctx.status = 200;
	});

	// outgoing: fetch a resource in local server (need server-authentication)
	router.get('/local/notes/:id', async (ctx, next) => {
		const serverId = 'b'; // TODO: authentication
		const id = ctx.params.id;

		const index = notes.findIndex(x => x.id == id && x.serverId == null);
		if (index == -1) {
			return await next();
		}

		ctx.body = {
			id: notes[index].id,
			text: notes[index].text,
		};
		ctx.status = 200;
	});

	// incoming: update resource event (need server-authentication)
	const noteUpdateSchema = Type.Object({
		id: Type.String(),
		text: Type.String(),
	});
	router.post('/remote/notes', async (ctx, next) => {
		const serverId = 'b'; // TODO: authentication

		if (!ajv.validate(noteUpdateSchema, ctx.request.body)) {
			ctx.body = { error: 'invalid-params' };
			ctx.status = 400;
			return;
		}
		const body = ctx.request.body as Static<typeof noteUpdateSchema>;

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

		ctx.body = note;
		ctx.status = 200;
	});

	// incoming: delete resource event (need server-authentication)
	router.delete('/remote/notes/:id', async (ctx, next) => {
		const serverId = 'b'; // TODO: authentication
		const id = ctx.params.id;

		const index = notes.findIndex(x => x.id == id && x.serverId == serverId);
		if (index == -1) {
			return await next();
		}
		notes.splice(index, 1);

		ctx.body = { deleted: true };
		ctx.status = 200;
	});

	return router.routes();
}
