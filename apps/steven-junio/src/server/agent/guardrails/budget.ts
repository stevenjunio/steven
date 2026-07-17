export interface BudgetCounter {
  limitMicros: number;
  spentMicros: number;
  reservedMicros: number;
}

export interface BudgetSnapshot {
  day: BudgetCounter;
  month: BudgetCounter;
}

function assertMicros(value: number, name: string) {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error(`${name} must be a non-negative safe integer.`);
}

export function evaluateBudgetReservation(current: BudgetSnapshot, estimateMicros: number) {
  assertMicros(estimateMicros, "estimateMicros");
  const blockedBy = (["day", "month"] as const).filter((period) => {
    const counter = current[period];
    return counter.spentMicros + counter.reservedMicros + estimateMicros > counter.limitMicros;
  });
  if (blockedBy.length) return { allowed: false as const, blockedBy };
  return {
    allowed: true as const,
    projected: {
      day: { ...current.day, reservedMicros: current.day.reservedMicros + estimateMicros },
      month: { ...current.month, reservedMicros: current.month.reservedMicros + estimateMicros },
    },
  };
}

function changeReservation(current: BudgetSnapshot, reservedMicros: number, actualMicros: number) {
  assertMicros(reservedMicros, "reservedMicros");
  assertMicros(actualMicros, "actualMicros");
  for (const period of ["day", "month"] as const) {
    if (current[period].reservedMicros < reservedMicros) throw new Error("Reservation underflow.");
  }
  return {
    day: {
      ...current.day,
      reservedMicros: current.day.reservedMicros - reservedMicros,
      spentMicros: current.day.spentMicros + actualMicros,
    },
    month: {
      ...current.month,
      reservedMicros: current.month.reservedMicros - reservedMicros,
      spentMicros: current.month.spentMicros + actualMicros,
    },
  };
}

export function reconcileReservation(current: BudgetSnapshot, reservedMicros: number, actualMicros: number) {
  const next = changeReservation(current, reservedMicros, actualMicros);
  return {
    next,
    actualExceededReservation: actualMicros > reservedMicros,
    overBudgetByMicros: {
      day: Math.max(0, next.day.spentMicros + next.day.reservedMicros - next.day.limitMicros),
      month: Math.max(0, next.month.spentMicros + next.month.reservedMicros - next.month.limitMicros),
    },
  };
}

export function releaseReservation(current: BudgetSnapshot, reservedMicros: number) {
  return changeReservation(current, reservedMicros, 0);
}

export function getBudgetPeriodKeys(now: Date) {
  const iso = now.toISOString();
  return { day: iso.slice(0, 10), month: iso.slice(0, 7) };
}

export function estimateCostMicros(input: {
  inputTokens: number;
  outputTokens: number;
  inputDollarsPerMillionTokens: number;
  outputDollarsPerMillionTokens: number;
}) {
  for (const [name, value] of Object.entries(input)) {
    if (!Number.isFinite(value) || value < 0) throw new Error(`${name} must be non-negative.`);
  }
  return Math.ceil(
    input.inputTokens * input.inputDollarsPerMillionTokens +
      input.outputTokens * input.outputDollarsPerMillionTokens,
  );
}
