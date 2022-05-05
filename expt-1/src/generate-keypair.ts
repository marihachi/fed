import { generateKeyPair as genKeyPair, RSAKeyPairOptions } from 'crypto';
import { promises as fs } from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';

type KeyPair = {
	publicKey: string;
	privateKey: string;
};

function generateKeyPair(): Promise<KeyPair> {
	const options: RSAKeyPairOptions<'pem', 'pem'> = {
		modulusLength: 2048,
		publicKeyEncoding: {
			type: 'spki',
			format: 'pem'
		},
		privateKeyEncoding: {
			type: 'pkcs8',
			format: 'pem'
			//cipher
			//passphrase
		}
	};
	return new Promise<KeyPair>((res, rej) => {
		genKeyPair('rsa', options, (err, publicKey, privateKey) => {
			if (err) {
				return rej(err);
			}
			res({ publicKey, privateKey });
		});
	});
}

async function entry() {
	const value = await generateKeyPair();

	const filepath = path.resolve(__dirname, '../keys/keypair.json');
	await mkdirp(path.dirname(filepath));
	await fs.writeFile(filepath, JSON.stringify(value));
	console.log('keypair saved.');
}

entry()
.catch(e => {
	console.log(e);
});
