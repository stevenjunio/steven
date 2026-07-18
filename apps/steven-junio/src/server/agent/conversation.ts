type CostedMessage = {
  role: string;
  createdAt: Date;
};

type CostedRun = {
  status: string;
  createdAt: Date;
  actualCostMicros: bigint | null;
};

export function attachRunCosts<TMessage extends CostedMessage>(
  messages: TMessage[],
  runs: CostedRun[],
): Array<TMessage & { costMicros?: number }> {
  let runIndex = 0;
  return messages.map((message) => {
    const run = runs[runIndex];
    if (
      message.role !== "ASSISTANT" ||
      !run ||
      run.createdAt.getTime() > message.createdAt.getTime()
    ) {
      return message;
    }
    runIndex += 1;
    return {
      ...message,
      costMicros:
        run.status === "SUCCEEDED" && run.actualCostMicros !== null
          ? Number(run.actualCostMicros)
          : undefined,
    };
  });
}
