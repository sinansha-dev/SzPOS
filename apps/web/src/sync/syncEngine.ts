import { clearQueue, readQueue } from "../data/localQueue";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";

export async function syncNow(): Promise<{ synced: number }> {
  const queue = readQueue();
  if (!queue.length) {
    return { synced: 0 };
  }

  const response = await fetch(`${API_BASE}/api/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ changes: queue })
  });

  if (!response.ok) {
    throw new Error("Sync failed");
  }

  clearQueue(queue.map((q) => q.id));
  return { synced: queue.length };
}
