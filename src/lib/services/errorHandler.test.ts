import { ErrorHandler } from '$lib/services/errorHandler';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock console methods
const originalConsoleError = console.error;

describe('ErrorHandler', () => {
	beforeEach(() => {
		console.error = vi.fn();
	});

	afterEach(() => {
		console.error = originalConsoleError;
		vi.clearAllMocks();
	});

	it('should handle component errors', () => {
		const error = new Error('Component error');
		ErrorHandler.handleComponentError(error, 'TestComponent');

		expect(console.error).toHaveBeenCalled();
	});

	it('should handle navigation errors', () => {
		const error = new Error('Navigation error');
		ErrorHandler.handleNavError(error, 'TestSection');

		expect(console.error).toHaveBeenCalled();
	});

	it('should handle API errors', () => {
		const error = new Error('API error');
		ErrorHandler.handleApiError(error, '/api/test', 'GET');

		expect(console.error).toHaveBeenCalled();
	});

	it('should handle scroll errors', () => {
		const error = new Error('Scroll error');
		ErrorHandler.handleScrollError(error, 'test-section');

		expect(console.error).toHaveBeenCalled();
	});

	it('should handle async operations with fallback', async () => {
		const fallbackValue = 'fallback';
		const operation = vi.fn().mockRejectedValue(new Error('Async error'));

		const result = await ErrorHandler.handleAsyncError(operation, 'test-context', fallbackValue);

		expect(result).toBe(fallbackValue);
		expect(console.error).toHaveBeenCalled();
	});

	it('should return successful async operation result', async () => {
		const expectedValue = 'success';
		const operation = vi.fn().mockResolvedValue(expectedValue);

		const result = await ErrorHandler.handleAsyncError(operation, 'test-context');

		expect(result).toBe(expectedValue);
		expect(console.error).not.toHaveBeenCalled();
	});
});
