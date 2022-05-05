import { signRequest } from 'http-signature';
import { readStream } from './misc/read-stream';
import { request } from './misc/request';

async function entry() {
	let keypair: { publicKey: string, privateKey: string };
	try {
		keypair = require('../keys/keypair.json');
	}
	catch(e) {
		throw new Error('keypair is not generated.');
	}

	const res = await request('http://localhost:3000/fed/port', {
		method: 'POST'
	}, (req) => {
		signRequest(req, {
			key: keypair.privateKey,
			keyId: 'http://localhost:3000/publickey',
			headers: ['date', 'host']
		});

		console.log('req header:');
		console.log(req.getHeaders());

		//req.end('{}');
		req.end();
	});

	console.log('res header:');
	console.log(res.headers);
	console.log('status:', res.statusCode);
	console.log('body:', await readStream(res));
}

entry()
.catch(e => {
	console.log('err:', e);
});
