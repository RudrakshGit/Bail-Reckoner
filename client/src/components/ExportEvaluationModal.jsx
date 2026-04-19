import { useEffect, useState } from "react";
import { getUndertrialById } from "../api/api";
import Button from "./ui/Button";
import FormField from "./ui/FormField";
import Input from "./ui/Input";

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function ExportEvaluationModal({ open, onClose }) {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setId("");
      setError(null);
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleExport = async (e) => {
    e.preventDefault();
    setError(null);
    const trimmed = id.trim();
    if (!trimmed) {
      setError("Enter an undertrial ID.");
      return;
    }
    setLoading(true);
    try {
      const undertrial = await getUndertrialById(trimmed);
      const safeName = trimmed.replace(/[^\w-]+/g, "_").slice(0, 40);
      downloadJson(`undertrial-${safeName}.json`, {
        exportedAt: new Date().toISOString(),
        source: "Bail Reckoner",
        undertrial,
      });
      onClose();
    } catch (err) {
      setError(err.message || "Could not export.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sheetOverlay" onClick={onClose} role="presentation">
      <div
        className="sheetDialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-eval-title"
      >
        <div className="sheetDialogTop">
          <h2 className="sheetDialogTitle" id="export-eval-title">
            Export evaluation by ID
          </h2>
          <button className="sheetDialogClose" type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <p className="sheetDialogLead">
          Downloads the stored undertrial record from the server (including <code>lastEvaluation</code> when it
          exists). Run <strong>Evaluate Stored Undertrial</strong> first if you need a fresh evaluation saved on
          the record.
        </p>
        <form className="sheetDialogForm" onSubmit={handleExport}>
          <FormField label="Undertrial ID" hint="MongoDB ObjectId">
            <Input
              placeholder="e.g. 6614c2…"
              value={id}
              onChange={(e) => setId(e.target.value)}
              autoComplete="off"
            />
          </FormField>
          {error ? (
            <div className="uiAlert uiAlertError" role="alert">
              <div className="uiAlertBody">{error}</div>
            </div>
          ) : null}
          <div className="sheetDialogActions">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Download JSON
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
