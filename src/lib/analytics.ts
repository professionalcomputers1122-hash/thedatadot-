/**
 * Consent-Guarded Analytics & Telemetry Layer
 * Respects Phase 8 Cookie Consent Architecture:
 * - Necessary: ON
 * - Analytics: OFF unless consented
 * - Marketing: OFF unless consented
 */

const STORAGE_KEY = "tdd_cookie_consent";

export function getCookieConsent(): {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
} {
  if (typeof window === "undefined") {
    return { necessary: true, analytics: false, marketing: false };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { necessary: true, analytics: false, marketing: false };
    const parsed = JSON.parse(raw);
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
    };
  } catch {
    return { necessary: true, analytics: false, marketing: false };
  }
}

/**
 * Tracks an analytics event only if the user has explicitly consented to Analytics cookies.
 */
export function trackAnalyticsEvent(eventName: string, properties?: Record<string, any>) {
  const consent = getCookieConsent();

  if (!consent.analytics) {
    // Silently suppress tracking when consent has not been granted
    if (process.env.NODE_ENV === "development") {
      console.log(`[ANALYTICS BLOCKED: Consent OFF] Event: "${eventName}"`);
    }
    return;
  }

  // If consent is granted, proceed with telemetry dispatch
  if (typeof window !== "undefined" && (window as any).dataLayer) {
    (window as any).dataLayer.push({
      event: eventName,
      ...properties,
      timestamp: new Date().toISOString(),
    });
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`[ANALYTICS DISPATCHED: Consent ON] Event: "${eventName}"`, properties);
  }
}

/**
 * Tracks a marketing or conversion event only if the user has consented to Marketing cookies.
 */
export function trackMarketingConversion(conversionName: string, value?: number) {
  const consent = getCookieConsent();

  if (!consent.marketing) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[MARKETING BLOCKED: Consent OFF] Conversion: "${conversionName}"`);
    }
    return;
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`[MARKETING DISPATCHED: Consent ON] Conversion: "${conversionName}"`, { value });
  }
}
