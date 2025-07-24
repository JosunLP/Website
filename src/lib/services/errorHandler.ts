export class ErrorHandler {
	private static isProduction = import.meta.env.PROD;

	private static logError(error: Error, context: string, metadata?: Record<string, unknown>) {
		const errorInfo = {
			message: error.message,
			stack: error.stack,
			context,
			timestamp: new Date().toISOString(),
			userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
			url: typeof window !== 'undefined' ? window.location.href : 'Server',
			...metadata
		};

		// Always log to console in development
		if (!this.isProduction) {
			console.error(`[${context}]`, errorInfo);
		}

		// Send to monitoring service in production
		if (this.isProduction && typeof window !== 'undefined') {
			this.sendToMonitoring(errorInfo);
		}
	}

	private static sendToMonitoring(errorInfo: Record<string, unknown>) {
		// Send to Google Analytics if available
		if (typeof window !== 'undefined' && 'gtag' in window) {
			const gtag = (window as { gtag: (...args: unknown[]) => void }).gtag;
			gtag('event', 'exception', {
				description: errorInfo.message,
				fatal: false,
				custom_map: {
					context: errorInfo.context,
					timestamp: errorInfo.timestamp
				}
			});
		}

		// Could also send to other monitoring services like Sentry
		// Example: Sentry.captureException(error, { contexts: { errorInfo } });
	}

	public static handleNavError(error: Error, section?: string) {
		this.logError(error, 'Navigation', { section });
	}

	public static handleApiError(error: Error, endpoint?: string, method?: string) {
		this.logError(error, 'API', { endpoint, method });
	}

	public static handleComponentError(error: Error, component?: string) {
		this.logError(error, 'Component', { component });
	}

	public static handleScrollError(error: Error, targetId?: string) {
		this.logError(error, 'Scroll', { targetId });
	}

	public static async handleAsyncError<T>(
		operation: () => Promise<T>,
		context: string,
		fallback?: T
	): Promise<T | undefined> {
		try {
			return await operation();
		} catch (error) {
			this.logError(error as Error, context);
			return fallback;
		}
	}
}

// Global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
	window.addEventListener('unhandledrejection', (event) => {
		ErrorHandler.handleComponentError(
			new Error(`Unhandled Promise Rejection: ${event.reason}`),
			'Global'
		);
	});

	window.addEventListener('error', (event) => {
		ErrorHandler.handleComponentError(new Error(`Global Error: ${event.message}`), 'Global');
	});
}
