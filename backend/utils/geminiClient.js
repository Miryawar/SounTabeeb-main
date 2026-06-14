const DEFAULT_MAX_RETRIES = 4;
const DEFAULT_BASE_DELAY = 400; // ms

// simple in-memory circuit breaker
const breaker = {
  failures: 0,
  openedAt: 0,
};

function recordFailure(threshold = 5) {
  breaker.failures = (breaker.failures || 0) + 1;
  if (breaker.failures >= threshold && !breaker.openedAt) {
    breaker.openedAt = Date.now();
    console.warn("Gemini circuit opened");
  }
}

function recordSuccess() {
  breaker.failures = 0;
  breaker.openedAt = 0;
}

function breakerAllows(cooldownMs = 60_000) {
  if (!breaker.openedAt) return true;
  const elapsed = Date.now() - breaker.openedAt;
  if (elapsed > cooldownMs) {
    // half-open: allow a single attempt
    breaker.failures = 0;
    breaker.openedAt = 0;
    return true;
  }
  return false;
}

function isTransientError(err) {
  const status = err?.status || err?.code || err?.response?.status;
  // Treat network errors (no status) as transient as well
  return (
    !status || status === 503 || status === 429 || status === "UNAVAILABLE"
  );
}

async function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

/**
 * Generate content with retries, exponential backoff + jitter, optional fallback model, and a simple circuit breaker.
 * - ai: initialized GenAI client (GoogleGenAI instance)
 * - model: string (fully qualified like 'models/gemini-2.5-flash')
 * - contents: string or array acceptable to SDK
 */
async function generateWithRetries({
  ai,
  model,
  contents,
  maxRetries = DEFAULT_MAX_RETRIES,
  baseDelay = DEFAULT_BASE_DELAY,
  fallbackModel,
  breakerThreshold = 5,
  breakerCooldownMs = 60_000,
}) {
  if (!ai || !ai.models || typeof ai.models.generateContent !== "function") {
    throw new Error("Invalid AI client provided to generateWithRetries");
  }

  if (!breakerAllows(breakerCooldownMs)) {
    const err = new Error("Circuit open: skipping AI request");
    err.status = 503;
    throw err;
  }

  let attempt = 0;
  let lastErr = null;
  let currentModel = model;

  while (attempt <= maxRetries) {
    try {
      const resp = await ai.models.generateContent({
        model: currentModel,
        contents,
      });
      // SDKs vary: try common locations for text
      const text =
        resp?.text ||
        resp?.output?.[0]?.content ||
        resp?.candidates?.[0]?.content ||
        "";
      if (!text || String(text).trim().length === 0) {
        // treat empty as transient
        const e = new Error("Empty response from model");
        e.status = 503;
        throw e;
      }
      recordSuccess();
      return String(text).trim();
    } catch (err) {
      lastErr = err;
      const transient = isTransientError(err);
      if (!transient) {
        // non-transient: rethrow immediately
        throw err;
      }

      attempt++;
      recordFailure(breakerThreshold);

      if (attempt > maxRetries) break;

      // switch to fallback model halfway if provided
      if (
        fallbackModel &&
        attempt === Math.max(1, Math.floor(maxRetries / 2))
      ) {
        currentModel = fallbackModel;
        console.warn(`Switching to fallback model: ${fallbackModel}`);
      }

      const jitter = Math.random() * 100;
      const delay = Math.min(baseDelay * 2 ** (attempt - 1) + jitter, 10000);
      console.warn(
        `AI transient error (attempt ${attempt}/${maxRetries}): ${err?.message || err}; retrying in ${Math.round(delay)}ms`,
      );
      await sleep(delay);
    }
  }

  const wrapper = new Error("AI provider unavailable after retries");
  wrapper.cause = lastErr;
  wrapper.status = lastErr?.status || 503;
  throw wrapper;
}

module.exports = { generateWithRetries, breakerAllows };
