const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000") + "/api";

// Direct Bail Evaluation
export const evaluateBail = async (data) => {
  const res = await fetch(`${BASE_URL}/bail/evaluate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload.message || "Error evaluating bail");
  }
  return payload;
};

// Create Undertrial
export const createUndertrial = async (data) => {
  const res = await fetch(`${BASE_URL}/undertrial/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload.message || "Error creating undertrial");
  }
  return payload;
};

// Fetch stored undertrial (includes lastEvaluation when present)
export const getUndertrialById = async (id) => {
  const res = await fetch(`${BASE_URL}/undertrial/${encodeURIComponent(id)}`);
  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload.message || "Error fetching undertrial");
  }
  return payload;
};

// Evaluate Undertrial
export const evaluateUndertrial = async (id) => {
  const res = await fetch(`${BASE_URL}/bail/evaluate-undertrial/${id}`, {
    method: "POST",
  });

  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload.message || "Error evaluating undertrial");
  }
  return payload;
};

export const listLegalSections = async (q = "") => {
  const url = new URL(`${BASE_URL}/bail/legal-sections`);
  if (q) url.searchParams.set("q", q);

  const res = await fetch(url.toString(), { method: "GET" });
  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload.message || "Error fetching legal sections");
  }
  return payload;
};