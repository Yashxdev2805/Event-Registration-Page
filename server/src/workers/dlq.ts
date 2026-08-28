export interface DLQItem {
  id: string;
  workerName: string;
  payload: any;
  error: string;
  failedAt: string;
  retryAttempts: number;
}

class DeadLetterQueueService {
  private queue: DLQItem[] = [];
  private readonly maxRetries = 3;
  private readonly backoffScheduleMs = [1000, 5000, 30000]; // 1s -> 5s -> 30s

  public getBackoffDelay(attempt: number): number {
    const idx = Math.min(attempt, this.backoffScheduleMs.length - 1);
    return this.backoffScheduleMs[idx];
  }

  public shouldRetry(attempt: number): boolean {
    return attempt < this.maxRetries;
  }

  public routeToDLQ(workerName: string, payload: any, error: any, attempts: number) {
    const dlqEntry: DLQItem = {
      id: `dlq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      workerName,
      payload,
      error: error?.message || String(error),
      failedAt: new Date().toISOString(),
      retryAttempts: attempts,
    };

    this.queue.push(dlqEntry);
    console.error(`🚨 [DLQ-ALERT] Event routed to Dead-Letter Queue from ${workerName}:`, {
      dlqId: dlqEntry.id,
      error: dlqEntry.error,
      attempts,
    });
  }

  public getDLQEntries(): readonly DLQItem[] {
    return this.queue;
  }
}

export const dlq = new DeadLetterQueueService();
