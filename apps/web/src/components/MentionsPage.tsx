import { useMemo, useState } from "react";
import { PageLayout } from "./PageLayout";
import { useAuth } from "../contexts/AuthContext";

interface Mention {
  id: string;
  note: string;
  createdBy: string;
  createdAt: string;
}

const STORAGE_KEY = "szpos-mentions";

const readMentions = (): Mention[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as Mention[];
  } catch {
    return [];
  }
};

export function MentionsPage() {
  const { user } = useAuth();
  const [note, setNote] = useState("");
  const [mentions, setMentions] = useState<Mention[]>(() => readMentions());

  const detectedMentions = useMemo(() => {
    const matches = note.match(/@[a-zA-Z0-9_]+/g) ?? [];
    return [...new Set(matches)];
  }, [note]);

  const handleSave = () => {
    if (!note.trim()) return;
    const next: Mention[] = [{
      id: `mention_${Date.now()}`,
      note: note.trim(),
      createdBy: user?.name ?? "Unknown",
      createdAt: new Date().toISOString()
    }, ...mentions];

    setMentions(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setNote("");
  };

  return (
    <PageLayout title="Mentions">
      <div className="mentions-container">
        <h2>Internal Mention Notes</h2>
        <p className="mentions-subtitle">Use @username to tag staff in quick notes.</p>

        <div className="form-card">
          <textarea
            className="mention-input"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Example: @john please verify stock count for CAKE-001"
            rows={4}
          />
          {detectedMentions.length > 0 && (
            <div className="mention-tags">
              {detectedMentions.map((item) => (
                <span key={item} className="mention-tag">{item}</span>
              ))}
            </div>
          )}
          <button className="btn-primary" onClick={handleSave}>Save Mention</button>
        </div>

        <div className="mentions-list">
          {mentions.map((item) => (
            <article key={item.id} className="mention-card">
              <p>{item.note}</p>
              <small>By {item.createdBy} • {new Date(item.createdAt).toLocaleString()}</small>
            </article>
          ))}
          {mentions.length === 0 && <p>No mention notes yet.</p>}
        </div>
      </div>
    </PageLayout>
  );
}
