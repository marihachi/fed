export function buildKey(serverId: string, resourceId: string) {
	const espacedServerId = serverId
		.replace('\\', '\\\\')
		.replace('/', '\\/');
	const espacedResourceId = resourceId
		.replace('\\', '\\\\')
		.replace('/', '\\/');
	return `${espacedServerId}/${espacedResourceId}`;
}
