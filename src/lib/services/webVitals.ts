import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

export interface WebVitalMetric {
	name: string;
	value: number;
	id: string;
	delta: number;
}

export class WebVitalsService {
	private static initialized = false;

	public static init() {
		if (this.initialized || typeof window === 'undefined') {
			return;
		}

		this.initialized = true;

		// Initialize all web vitals tracking
		onCLS(this.sendToAnalytics);
		onINP(this.sendToAnalytics); // INP replaced FID as Core Web Vital
		onFCP(this.sendToAnalytics);
		onLCP(this.sendToAnalytics);
		onTTFB(this.sendToAnalytics);

		console.log('Web Vitals tracking initialized');
	}

	private static sendToAnalytics(metric: WebVitalMetric) {
		// Log to console in development
		if (!import.meta.env.PROD) {
			console.log('Web Vital:', {
				name: metric.name,
				value: Math.round(metric.value),
				rating: WebVitalsService.getRating(metric.name, metric.value)
			});
		}

		// Send to Google Analytics if available
		if (typeof window !== 'undefined' && 'gtag' in window) {
			const gtag = (window as { gtag: (...args: unknown[]) => void }).gtag;
			gtag('event', metric.name, {
				event_category: 'Web Vitals',
				value: Math.round(metric.value),
				metric_id: metric.id,
				metric_value: metric.value,
				metric_delta: metric.delta,
				metric_rating: WebVitalsService.getRating(metric.name, metric.value)
			});
		}

		// Could also send to other analytics services
		// Example: send to custom analytics endpoint
		if (import.meta.env.PROD) {
			WebVitalsService.sendToCustomEndpoint(metric);
		}
	}

	private static getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
		// Web Vitals thresholds according to Google
		const thresholds = {
			CLS: { good: 0.1, poor: 0.25 },
			FID: { good: 100, poor: 300 },
			FCP: { good: 1800, poor: 3000 },
			LCP: { good: 2500, poor: 4000 },
			TTFB: { good: 800, poor: 1800 }
		};

		const threshold = thresholds[name as keyof typeof thresholds];
		if (!threshold) return 'good';

		if (value <= threshold.good) return 'good';
		if (value <= threshold.poor) return 'needs-improvement';
		return 'poor';
	}

	private static async sendToCustomEndpoint(metric: WebVitalMetric) {
		try {
			await fetch('/api/analytics/web-vitals', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name: metric.name,
					value: metric.value,
					id: metric.id,
					delta: metric.delta,
					rating: WebVitalsService.getRating(metric.name, metric.value),
					timestamp: Date.now(),
					url: window.location.href,
					userAgent: navigator.userAgent
				})
			});
		} catch (error) {
			console.warn('Failed to send web vitals to custom endpoint:', error);
		}
	}

	// Public method to manually track custom metrics
	public static trackCustomMetric(name: string, value: number, metadata?: Record<string, unknown>) {
		if (typeof window !== 'undefined' && 'gtag' in window) {
			const gtag = (window as { gtag: (...args: unknown[]) => void }).gtag;
			gtag('event', 'custom_metric', {
				event_category: 'Custom Metrics',
				metric_name: name,
				metric_value: value,
				...metadata
			});
		}

		console.log(`Custom Metric - ${name}:`, value, metadata);
	}
}
