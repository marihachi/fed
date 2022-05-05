import { Result, ok, err } from './result';

export function validateUrl(urlString: string): Result<URL, string> {
	let url: URL;
	try {
		url = new URL(urlString);
	}
	catch {
		return err('invalid url');
	}

	if (!['http:', 'https:'].includes(url.protocol)) {
		return err('unsupported protocol type');
	}

	return ok(url);
}
