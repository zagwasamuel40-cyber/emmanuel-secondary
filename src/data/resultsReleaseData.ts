import { useState, useEffect } from "react";

// Structure: { [key: string]: boolean }
// Keys can be "2025/2026 - First Term" or "2025/2026 - First Term|SSS 3A" or "ALL"
export const initialReleaseMap: Record<string, boolean> = {
  "2025/2026 - First Term": true,
  "2025/2026 - First Term|All Classes": true,
  "2025/2026 - Second Term": false,
  "2025/2026 - Third Term": false,
  "2026/2027 - First Term": false,
};

export function getReleasedMap(): Record<string, boolean> {
  const saved = localStorage.getItem("ess_released_results");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === "object") return parsed;
    } catch (e) {
      console.error(e);
    }
  }
  return initialReleaseMap;
}

export function saveReleasedMap(map: Record<string, boolean>) {
  localStorage.setItem("ess_released_results", JSON.stringify(map));
  window.dispatchEvent(new Event("ess_results_release_change"));
}

export function isResultReleased(sessionYear: string, term: string, className?: string): boolean {
  const map = getReleasedMap();
  
  // Check exact session-term-class key
  if (className && className !== "All Classes") {
    const classKey = `${sessionYear} - ${term}|${className}`;
    if (map[classKey] !== undefined) return map[classKey];
  }

  // Check session-term key
  const sessionTermKey = `${sessionYear} - ${term}`;
  if (map[sessionTermKey] !== undefined) return map[sessionTermKey];

  // Check full session key or "ALL"
  const fullSessionKey = sessionYear.includes(term) ? sessionYear : `${sessionYear} - ${term}`;
  if (map[fullSessionKey] !== undefined) return map[fullSessionKey];

  if (map["ALL"] !== undefined) return map["ALL"];

  return false;
}

export function toggleResultRelease(sessionYear: string, term: string, className?: string, forceStatus?: boolean) {
  const map = getReleasedMap();
  const key = className && className !== "All Classes" 
    ? `${sessionYear} - ${term}|${className}`
    : `${sessionYear} - ${term}`;

  const currentStatus = isResultReleased(sessionYear, term, className);
  const nextStatus = forceStatus !== undefined ? forceStatus : !currentStatus;

  const newMap = {
    ...map,
    [key]: nextStatus,
    [`${sessionYear} - ${term}`]: nextStatus
  };

  saveReleasedMap(newMap);
  return nextStatus;
}

export function useResultsRelease() {
  const [releaseMap, setReleaseMapState] = useState<Record<string, boolean>>(() => getReleasedMap());

  useEffect(() => {
    const handleUpdate = () => {
      setReleaseMapState(getReleasedMap());
    };
    window.addEventListener("ess_results_release_change", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("ess_results_release_change", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const updateRelease = (sessionYear: string, term: string, className?: string, forceStatus?: boolean) => {
    return toggleResultRelease(sessionYear, term, className, forceStatus);
  };

  return [releaseMap, updateRelease] as const;
}
