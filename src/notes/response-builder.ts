import Koa from 'koa';

export class ResponseBuilder {
	ctx: Koa.Context;

	constructor(ctx: ResponseBuilder['ctx']) {
		this.ctx = ctx;
	}

	success(status: number, body: unknown) {
		this.ctx.body = body;
		this.ctx.status = status;
	}

	error(status: number, message: string) {
		this.ctx.body = { error: message };
		this.ctx.status = status;
	}
}
