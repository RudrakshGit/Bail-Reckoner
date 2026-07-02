import { useState, useEffect, useRef } from "react";
import { listLegalSections } from "../api/api";

/**
 * Custom hook that fetches section suggestions with a 300ms debounce.
 *
 * @param {string} rawInput – The current comma-separated sections string.
 * @returns {Array} – Array of suggestion objects ({ sectionNumber, act, offenceName }).
 */
export default function useSectionSuggestions(rawInput) {
  const [suggestions, setSuggestions] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    // Extract the last token being typed (after the final comma)
    const q = rawInput.split(",").slice(-1)[0]?.trim() || "";

    // Clear any pending debounce
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!q) {
      setSuggestions([]);
      return;
    }

    let alive = true;

    timerRef.current = setTimeout(() => {
      listLegalSections(q)
        .then((items) => {
          if (alive) setSuggestions(items);
        })
        .catch(() => {
          if (alive) setSuggestions([]);
        });
    }, 300);

    return () => {
      alive = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [rawInput]);

  return suggestions;
}
