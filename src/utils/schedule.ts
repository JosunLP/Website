/**
 * Deferring work that is not part of the first paint.
 *
 * Both islands that use this enhance content the server already rendered
 * correctly — a manifest that usually reports no change, and a filter UI
 * that only exists once JavaScript runs. Running either during load
 * competes with the paint of content that is already on screen, so both
 * wait for the browser to be idle.
 */

interface IdleWindow {
	requestIdleCallback?: (
		callback: () => void,
		options?: { timeout: number },
	) => number;
}

/**
 * Runs `task` when the browser is next idle, or after `timeout` ms at the
 * latest. Falls back to a macrotask where `requestIdleCallback` is
 * missing (Safari below 18) — later than idle would be, but still off the
 * critical path.
 */
export function whenIdle(task: () => void, timeout = 2000): void {
	const idle = (globalThis as IdleWindow).requestIdleCallback;
	if (typeof idle === 'function') {
		idle(task, { timeout });
		return;
	}
	setTimeout(task, 1);
}
