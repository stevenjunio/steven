export const PUBLIC_GUARDRAIL_LIMITS = Object.freeze({
  maxInputChars: 1_500,
  requestsPerMinute: 5,
  requestsPerDay: 10,
  maxConcurrent: 3,
  dailyBudgetMicros: 500_000,
});

export const PRIVATE_GUARDRAIL_LIMITS = Object.freeze({
  maxInputChars: 8_000,
  requestsPerDay: 60,
});

export const META_PROVIDER_GUARDRAIL_LIMITS = Object.freeze({
  monthlyBudgetMicros: 5_000_000,
});
