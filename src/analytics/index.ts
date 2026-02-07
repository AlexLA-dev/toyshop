/**
 * Analytics event tracking (stubs for MVP).
 *
 * In production, these would be sent to an analytics service.
 * For now, events are logged to the console in development mode.
 */

export interface AnalyticsEvent {
  type: string;
  [key: string]: unknown;
}

const eventLog: AnalyticsEvent[] = [];

export function trackEvent(event: AnalyticsEvent): void {
  const timestamped = { ...event, timestamp: Date.now() };
  eventLog.push(timestamped);

  if (import.meta.env.DEV) {
    console.debug('[Analytics]', timestamped);
  }
}

export function getEventLog(): AnalyticsEvent[] {
  return [...eventLog];
}

export function clearEventLog(): void {
  eventLog.length = 0;
}
