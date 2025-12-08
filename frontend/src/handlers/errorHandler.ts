export type ErrorHandler = (error: unknown) => void;

export interface ErrorHandlerOptions {
	silent?: boolean;
	onError?: ErrorHandler;
}

export const handleError = (
	error: unknown,
	options: ErrorHandlerOptions = {}
): void => {
	const {silent = false, onError} = options;

	if (onError) {
		onError(error);
		return;
	}

	if (silent) {
		return;
	}

	if (import.meta.env.DEV) {
		console.error("Error:", error);
	}
};

export const withErrorHandler = <
	T extends (...args: unknown[]) => Promise<unknown>
>(
	fn: T,
	options: ErrorHandlerOptions = {}
): T => {
	return ((...args: Parameters<T>) => {
		return fn(...args).catch((error) => {
			handleError(error, options);
			throw error;
		});
	}) as T;
};

export const safeExecute = async <T>(
	fn: () => Promise<T>,
	options: ErrorHandlerOptions = {}
): Promise<T | undefined> => {
	try {
		return await fn();
	} catch (error) {
		handleError(error, options);
		return undefined;
	}
};

export const safeExecuteWithResult = async <T>(
	fn: () => Promise<T>,
	options: ErrorHandlerOptions = {}
): Promise<{success: boolean; data?: T; error?: unknown}> => {
	try {
		const data = await fn();
		return {success: true, data};
	} catch (error) {
		handleError(error, options);
		return {success: false, error};
	}
};
