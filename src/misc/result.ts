export type Result<T, E> = OkResult<T> | ErrorResult<E>;
export type OkResult<T> = { success: true, value: T };
export type ErrorResult<E> = { success: false, err: E };

export function ok<T>(value: T): OkResult<T> {
	return { success: true, value };
}

export function err<E>(err: E): ErrorResult<E> {
	return { success: false, err };
}
