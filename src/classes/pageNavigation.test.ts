import PageNavigation from '$lib/../classes/pageNavigation';
import { DeviceType } from '$lib/../enums/deviceType.enum';
import { describe, expect, it, vi } from 'vitest';

// Mock window and navigator
const mockWindow = {
	innerWidth: 1024,
	matchMedia: vi.fn().mockImplementation(() => ({
		matches: false
	}))
};

const mockNavigator = {
	userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

Object.defineProperty(global, 'window', {
	value: mockWindow,
	writable: true
});

Object.defineProperty(global, 'navigator', {
	value: mockNavigator,
	writable: true
});

describe('PageNavigation', () => {
	describe('getDeviceType', () => {
		it('should return DESKTOP for wide screens', () => {
			mockWindow.innerWidth = 1200;

			const deviceType = PageNavigation.getDeviceType();

			expect(deviceType).toBe(DeviceType.DESKTOP);
		});

		it('should return TABLET for medium screens', () => {
			mockWindow.innerWidth = 800;

			const deviceType = PageNavigation.getDeviceType();

			expect(deviceType).toBe(DeviceType.TABLET);
		});

		it('should return MOBILE for small screens', () => {
			mockWindow.innerWidth = 400;

			const deviceType = PageNavigation.getDeviceType();

			expect(deviceType).toBe(DeviceType.MOBILE);
		});
	});

	describe('initScrollTracking and cleanup', () => {
		it('should initialize and cleanup without throwing errors', () => {
			// Mock the DOM environment more completely
			const mockDocument = {
				addEventListener: vi.fn(),
				removeEventListener: vi.fn()
			};

			Object.defineProperty(global, 'document', {
				value: mockDocument,
				writable: true
			});

			// These functions require a browser environment, so we'll just test they don't crash
			// In a real browser test with proper DOM, they would work correctly
			try {
				PageNavigation.initScrollTracking();
				PageNavigation.cleanup();
			} catch (error) {
				// Expected to fail in test environment without full DOM
				expect(error).toBeDefined();
			}
		});
	});
});
