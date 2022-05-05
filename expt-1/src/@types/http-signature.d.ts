declare module 'http-signature' {
	export type ParseTargetRequest = {
		headers: Record<string, any>; // IncomingMessage
		method?: string; // IncomingMessage
		url?: string; // IncomingMessage
		httpVersion: string; // on IncomingMessage
	};

	export type SignTargetRequest = {
		method: string; // on ClientRequest, OutgoingMessage
		path: string; // on ClientRequest, OutgoingMessage
		getHeader(name: string): number | string | string[] | undefined; // on OutgoingMessage
		setHeader(name: string, value: number | string | ReadonlyArray<string>): void; // on OutgoingMessage
	};

	export type ParsedSignature = {
		scheme: string;
		params: {
			[x: string]: any;
			keyId: string;
			algorithm: string;
			headers: string[];
			signature: string;
			opaque?: string;
			expires?: number;
			created?: number;
		};
		signingString: string;
		algorithm: string; // alias for params.algorithm
		keyId: string;     // alias for params.keyId
		opaque?: string;   // alias for params.opaque
	};

	export type ParseRequestOpts = {
		clockSkew?: number;
		headers?: string[];
		algorithms?: string;
		strict?: boolean;
	};

	export type SignRequestOpts = {
		algorithm?: string;
		keyId: string;
		key: string | Buffer;
		headers?: string[];
		httpVersion?: string;
		expiresIn?: number;
		keyPassphrase?: string;
	};

	export function parseRequest(request: ParseTargetRequest, options?: ParseRequestOpts): ParsedSignature;
	export function signRequest(request: SignTargetRequest, options: SignRequestOpts): boolean;
	export function verifySignature(parsedSignature: ParsedSignature, pubkey: string): boolean;
}
