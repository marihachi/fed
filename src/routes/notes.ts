import Router from '@koa/router';

type Note = {
	id: string,
	text: string,
	serverId?: string;
};

export default function() {
	const router = new Router();
	const notes: Note[] = [];

	// fetch a resource in this server
	router.get('/notes/:id', async (ctx, next) => {
		// validate id
		if (!/^([0-9]|[1-9][0-9]+)$/.test(ctx.params.id)) {
			return await next();
		}
		const id = ctx.params.id;

		// get resource
		const index = notes.findIndex(x => x.id == id && x.serverId == null);
		if (index == -1) {
			return await next();
		}

		// pack
		ctx.body = {
			id: notes[index].id,
			text: notes[index].text,
		};
	});

	// fetch a resource in remote servers
	router.get('/:serverId/notes/:id', async (ctx, next) => {
		// validate server
		const serverId = ctx.params.serverId;

		// validate id
		if (!/^([0-9]|[1-9][0-9]+)$/.test(ctx.params.id)) {
			return await next();
		}
		const id = ctx.params.id;

		// get resource
		const index = notes.findIndex(x => x.id == id && x.serverId == serverId);
		if (index == -1) {
			return await next();
		}

		// pack
		ctx.body = {
			id: notes[index].id,
			text: notes[index].text,
		};
	});

	// incoming update event
	router.post('/:serverId/notes', async (ctx, next) => {
		// validate server
		const serverId = ctx.params.serverId;

		// req body
		if (ctx.request.body == null) {
			ctx.status = 400;
			return await next();
		}
		const noteSource = ctx.request.body as any;

		// validate resource
		if (noteSource == null || noteSource.id == null || noteSource.text == null) {
			ctx.status = 400;
			return await next();
		}

		// get resource
		const index = notes.findIndex(x => x.id == noteSource.id && x.serverId == serverId);

		// resource object
		const note = {
			id: noteSource.id,
			text: noteSource.text,
			serverId: serverId,
		};

		// update resource
		if (index == -1) {
			notes.push(note);
		}
		else {
			notes[index] = note;
		}

		ctx.status = 200;
	});

	// incoming delete event
	router.delete('/:serverId/notes/:id', async (ctx, next) => {
		// validate server
		const serverId = ctx.params.serverId;

		// validate id
		if (!/^([0-9]|[1-9][0-9]+)$/.test(ctx.params.id)) {
			ctx.status = 400;
			return await next();
		}
		const id = ctx.params.id

		// get resource
		const index = notes.findIndex(x => x.id == id && x.serverId == serverId);
		if (index == -1) {
			ctx.status = 404;
			return await next();
		}

		// delete resource
		notes.splice(index, 1);

		ctx.body = { deleted: true };
		ctx.status = 200;
	});

	return router.routes();
}
