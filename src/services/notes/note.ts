import { Type } from '@sinclair/typebox';

export type LocalNote = {
	id: string,
	text: string,
};

export type RemoteNote = {
	id: string,
	text: string,
	serverId: string;
};

export const remoteNoteSchema = Type.Object({
	id: Type.String(),
	text: Type.String(),
	serverId: Type.String(),
});
