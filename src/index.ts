import Koa from 'koa';
import KoaRouter from '@koa/router';
import httpSignature, { ParsedSignature } from 'http-signature';
import { validateUrl } from './misc/validate-url';

async function entry() {

	let keypair: { publicKey: string, privateKey: string };
	try {
		keypair = require('../keys/keypair.json');
	}
	catch(e) {
		throw new Error('keypair is not generated.');
	}

	const app = new Koa();

	const router = new KoaRouter();
	router.get('/', async ctx => {
		ctx.body = 'hello';
		ctx.status = 200;
	});

	router.post('/fed/inbox', async ctx => {

		console.log('req headers:');
		console.log(ctx.req.headers);

		// parse HTTP Signature
		let signature: ParsedSignature;
		try {
			signature = httpSignature.parseRequest(ctx.req, { headers: ['date', 'host' /*'digest'*/] });
		}
		catch(e) {
			console.log(e);
			ctx.status = 401;
			return;
		}

		// validate keyId as URL
		const validateUrlResult = validateUrl(signature.params.keyId);
		if (!validateUrlResult.success) {
			console.log(validateUrlResult.err);
			ctx.status = 401;
			return;
		}

		// verify HTTP Signature
		if (!httpSignature.verifySignature(signature, keypair.publicKey)) {
			console.log('failed to verify the signature');
			ctx.status = 401;
			return;
		}

		console.log('valid signature');

		ctx.body = 'hello';
		ctx.status = 200;
	});

	app.use(router.routes());

	app.listen(3000, () => {
		console.log('started');
	});
}

entry()
.catch(e => {
	console.log(e);
});
