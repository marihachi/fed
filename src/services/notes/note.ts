export type LocalNote = {
	id: string,
	text: string,
};

export type RemoteNote = {
	id: string,
	text: string,
	serverId: string;
};
