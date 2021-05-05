import * as https from 'https';

import http, { IncomingMessage, ClientRequest } from 'http';

export function request(url: string | URL, opts: https.RequestOptions, handler: (req: ClientRequest) => void) {
	return new Promise<IncomingMessage>((resolve) => {
		let req = http.request(url, opts, (res) => {
			resolve(res);
		});
		handler(req);
	});
}
