import Router from '@koa/router';

type Note = {
	id: string,
	text: string,
	serverId?: string;
};

export default function() {
	const router = new Router();
	const notes: Note[] = [];

	router.get('/notes/:target', async (ctx, next) => {
		const target = ctx.params.target;
		let server: string | undefined, name: string;
		let match = /^@(.+)@(.+)$/.exec(target);
		if (match != null) {
			name = match[1];
			server = match[2];
		}
		else {
			match = /^@(.+)$/.exec(target);
			if (match != null) {
				name = match[1];
			}
			else {
				return await next();
			}
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
	});

	// fetch a resource in this server
	router.get('/port/notes/:id', async (ctx, next) => {
		const id = ctx.params.id;

		const index = notes.findIndex(x => x.id == id && x.serverId == null);
		if (index == -1) {
			return await next();
		}

		ctx.body = {
			id: notes[index].id,
			text: notes[index].text,
		};
	});

	// incoming update event
	router.post('/port/:serverId/notes', async (ctx, next) => {
		const serverId = ctx.params.serverId;

		if (ctx.request.body == null) {
			ctx.status = 400;
			return await next();
		}
		const noteSource = ctx.request.body as any;

		if (noteSource == null || noteSource.id == null || noteSource.text == null) {
			ctx.status = 400;
			return await next();
		}

		const index = notes.findIndex(x => x.id == noteSource.id && x.serverId == serverId);

		const note = {
			id: noteSource.id,
			text: noteSource.text,
			serverId: serverId,
		};

		if (index == -1) {
			notes.push(note);
		}
		else {
			notes[index] = note;
		}

		ctx.status = 200;
	});

	// incoming delete event
	router.delete('/port/:serverId/notes/:id', async (ctx, next) => {
		const serverId = ctx.params.serverId;
		const id = ctx.params.id

		const index = notes.findIndex(x => x.id == id && x.serverId == serverId);
		if (index == -1) {
			ctx.status = 404;
			return await next();
		}

		notes.splice(index, 1);

		ctx.body = { deleted: true };
		ctx.status = 200;
	});

	return router.routes();
}
