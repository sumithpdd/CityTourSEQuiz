type ClientErrorPayload = {
  source: string;
  message?: string;
  errorName?: string;
  stack?: string;
  extra?: Record<string, unknown>;
};

export async function logClientError(payload: ClientErrorPayload) {
  try {
    const enrichedPayload = {
      ...payload,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      timestamp: new Date().toISOString(),
    };

    await fetch('/api/log-client-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enrichedPayload),
    });
  } catch (err) {
    // As a fallback, still log to the console so something shows up in dev tools
    // This should never break the user flow.
    console.error('Failed to send client error log', err);
  }
}


