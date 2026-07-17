export const PUBLIC_GUARDRAIL_LIMITS = Object.freeze({
  maxInputChars: 1_500,
  requestsPerMinute: 5,
  requestsPerDay: 10,
  maxConcurrent: 3,
  dailyBudgetMicros: 500_000,
  monthlyBudgetMicros: 5_000_000,
});

export const PRIVATE_GUARDRAIL_LIMITS = Object.freeze({
  maxInputChars: 8_000,
  requestsPerDay: 60,
  monthlyBudgetMicros: 5_000_000,
});
