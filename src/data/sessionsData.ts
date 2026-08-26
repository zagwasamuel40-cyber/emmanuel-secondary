import { useState, useEffect } from "react";

const initialSessions = ["2024/2025", "2025/2026", "2026/2027"];

export function getStoredSessions(): string[] {
  const saved = localStorage.getItem("ess_sessions");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  return initialSessions;
}

export function getStoredCurrentSession(): string {
  const saved = localStorage.getItem("ess_current_session");
  if (saved) return saved;
  const list = getStoredSessions();
  return list[list.length - 1] || "2025/2026";
}

export function useSessions() {
  const [sessions, setSessionsState] = useState<string[]>(getStoredSessions);
  const [currentSession, setCurrentSessionState] = useState<string>(getStoredCurrentSession);

  useEffect(() => {
    const handleUpdate = () => {
      setSessionsState(getStoredSessions());
      setCurrentSessionState(getStoredCurrentSession());
    };

    window.addEventListener("ess_sessions_change", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("ess_sessions_change", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const setSessions = (newSessions: string[] | ((prev: string[]) => string[])) => {
    const current = getStoredSessions();
    const nextSessions = typeof newSessions === "function" ? newSessions(current) : newSessions;
    localStorage.setItem("ess_sessions", JSON.stringify(nextSessions));
    if (nextSessions.length > 0) {
      const latest = nextSessions[nextSessions.length - 1];
      localStorage.setItem("ess_current_session", latest);
    }
    window.dispatchEvent(new Event("ess_sessions_change"));
  };

  const setCurrentSession = (session: string) => {
    localStorage.setItem("ess_current_session", session);
    window.dispatchEvent(new Event("ess_sessions_change"));
  };

  const addSession = (session: string) => {
    const trimmed = session.trim();
    if (!trimmed) return;
    const current = getStoredSessions();
    if (!current.includes(trimmed)) {
      const updated = [...current, trimmed];
      localStorage.setItem("ess_sessions", JSON.stringify(updated));
      localStorage.setItem("ess_current_session", trimmed);
      window.dispatchEvent(new Event("ess_sessions_change"));
    } else {
      localStorage.setItem("ess_current_session", trimmed);
      window.dispatchEvent(new Event("ess_sessions_change"));
    }
  };

  return [sessions, setSessions, currentSession, setCurrentSession, addSession] as const;
}

export const TERMS = ["First Term", "Second Term", "Third Term"];

