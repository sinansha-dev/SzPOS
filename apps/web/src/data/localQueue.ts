const KEY = "szpos.offline.queue";

export type QueuedChange = {
  id: string;
  entity: "sale" | "inventory";
  operation: "create" | "update";
  payload: Record<string, unknown>;
  timestamp: string;
  deviceId: string;
};

export function enqueue(change: QueuedChange): void {
  const existing = readQueue();
  localStorage.setItem(KEY, JSON.stringify([...existing, change]));
}

export function readQueue(): QueuedChange[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as QueuedChange[];
  } catch {
    return [];
  }
}

export function clearQueue(ids: string[]): void {
  const keep = readQueue().filter((c) => !ids.includes(c.id));
  localStorage.setItem(KEY, JSON.stringify(keep));
}
