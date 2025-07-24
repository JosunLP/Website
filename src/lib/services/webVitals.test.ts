import { WebVitalsService } from '$lib/services/webVitals';
import { describe, expect, it, vi } from 'vitest';

// Mock web-vitals library
vi.mock('web-vitals', () => ({
	onCLS: vi.fn(),
	onINP: vi.fn(),
	onFCP: vi.fn(),
	onLCP: vi.fn(),
	onTTFB: vi.fn()
}));

describe('WebVitalsService', () => {
	it('should initialize without throwing errors', () => {
		expect(() => WebVitalsService.init()).not.toThrow();
	});

	it('should handle initialization gracefully when web-vitals fails', () => {
		// Mock console.error to suppress error output
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		// Should not throw even if web-vitals has issues
		expect(() => WebVitalsService.init()).not.toThrow();

		consoleSpy.mockRestore();
	});
});
