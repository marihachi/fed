import Koa from 'koa';
import KoaRouter from '@koa/router';
import httpSignature, { ParsedSignature } from 'http-signature';
import { validateUrl } from './misc/validate-url';
import Ajv, { ValidateFunction } from 'ajv';
import { err, ok } from './misc/result';

type ServerInfo = {
	capabilites: string[];
};

type FedDescription = {
	components?: (FedSchemaComponent | string)[];
};

type FedSchemaComponent = {
	name: string;
	serviceName: string;
	objects?: FedSchemaObject[];
	events?: FedSchemaEvent[];
	actions?: FedSchemaAction[];
};

type FedSchemaObject = {
	name: string;
	props?: FedSchemaObjectProp[];
};

type FedSchemaObjectProp = {
	name: string;
	type: string;
};

type FedSchemaEvent = {
	name: string;
};

type FedSchemaAction = {
	name: string;
	payload?: string;
};

class Fed {
	private validateSchema: ValidateFunction;

	constructor() {
		const schema = require('../json/descriptor-schema.json');
		const ajv = new Ajv();
		this.validateSchema = ajv.compile(schema);
	}

	loadDescription(src: object) {
		if (typeof src == 'string') {
			src = JSON.parse(src) ;
		}
		const valid = this.validateSchema(src);
		if (!valid) {
			return err('invalid-description-data');
		}

		return ok(src as FedDescription);
	}
}

async function entry() {

	const serverInfo: ServerInfo = {
		capabilites: [
			'Microblog'
		]
	};


	const fed = new Fed();

	const data = require('../json/descriptor.json');
	const loadResult = fed.loadDescription(data);
	if (!loadResult.success) {
		console.log('loading error:', loadResult.err);
		return;
	}
	const description = loadResult.value;
	console.log('loaded');

	if (description.components) {
		for (const component of description.components) {
			if (typeof component == 'string') {
				console.log(' component url:', component);
			}
			else {
				console.log(' service:', component.serviceName);
				console.log(' component:', component.name);
				if (component.objects) {
					for (const obj of component.objects) {
						console.log('  object:', obj.name);
					}
				}
				if (component.actions) {
					for (const action of component.actions) {
						console.log('  action:', action.name);
					}
				}
				if (component.events) {
					for (const ev of component.events) {
						console.log('  event:', ev.name);
					}
				}
			}
		}
	}




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

	router.get('/fed/meta', async ctx => {
		ctx.body = JSON.stringify({});
		ctx.status = 200;
	});

	router.post('/fed/port', async ctx => {

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

		ctx.body = 'ok';
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
