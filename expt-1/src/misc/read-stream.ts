import { Readable } from "node:stream";

export function readStream(stream: Readable): Promise<string> {
	return new Promise((resolve, reject) => {
		if (stream.readableEnded) {
			return reject('stream-already-ended');
		}
		let data = '';
		const onData = (chunk: any) => {
			data += chunk;
		};
		const onEnd = () => {
			stream.removeListener('data', onData);
			stream.removeListener('end', onEnd);
			resolve(data);
		};
		stream.on('data', onData);
		stream.on('end', onEnd);
	});
}
