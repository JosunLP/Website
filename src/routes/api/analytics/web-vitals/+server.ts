import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();

		// Log web vitals data
		console.log('Web Vitals:', data);

		// In production, you might want to send this to your analytics service
		// await sendToAnalytics(data);

		return json({ success: true });
	} catch (error) {
		console.error('Error processing web vitals:', error);
		return json({ success: false, error: 'Failed to process web vitals' }, { status: 500 });
	}
};
