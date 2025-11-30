export type ErrorHandler = (error: unknown) => void;

export interface ErrorHandlerOptions {
	silent?: boolean;
	onError?: ErrorHandler;
}

/**
 * Handles errors in a centralized way
 * @param error - The error to handle
 * @param options - Error handling options
 */
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

	// In development, log errors for debugging
	if (import.meta.env.DEV) {
		console.error("Error:", error);
	}

	// In production, you might want to send to error tracking service
	// Example: errorTrackingService.log(error);
};

/**
 * Wraps an async function with error handling
 * @param fn - The async function to wrap
 * @param options - Error handling options
 * @returns The wrapped function
 */
export const withErrorHandler = <
	T extends (...args: unknown[]) => Promise<unknown>
>(
	fn: T,
	options: ErrorHandlerOptions = {}
): T => {
	return ((...args: Parameters<T>) => {
		return fn(...args).catch((error) => {
			handleError(error, options);
			throw error; // Re-throw to allow caller to handle if needed
		});
	}) as T;
};

/**
 * Executes an async function with error handling
 * @param fn - The async function to execute
 * @param options - Error handling options
 * @returns The result of the function or undefined if error occurred
 */
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

/**
 * Executes an async function with error handling and returns a result object
 * @param fn - The async function to execute
 * @param options - Error handling options
 * @returns Object with success flag and data/error
 */
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
