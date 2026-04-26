import { useEffect, useState } from "react";

export function useTaskProgress(allTaskIds: string[]) {
  const [completed, setCompleted] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = localStorage.getItem("occasia.tasks");
      return raw ? new Set<string>(JSON.parse(raw)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  useEffect(() => {
    localStorage.setItem("occasia.tasks", JSON.stringify(Array.from(completed)));
  }, [completed]);

  const toggle = (id: string) =>
    setCompleted((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const reset = () => setCompleted(new Set());

  const total = allTaskIds.length;
  const done = allTaskIds.filter((id) => completed.has(id)).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return { completed, toggle, reset, pct, done, total };
}
