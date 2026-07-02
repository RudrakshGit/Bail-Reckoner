import { useState } from "react";
import { createUndertrial } from "../api/api";
import useSectionSuggestions from "../hooks/useSectionSuggestions";
import Card from "./ui/Card";
import Button from "./ui/Button";
import FormField from "./ui/FormField";
import Input from "./ui/Input";
import RiskSlider from "./ui/RiskSlider";
import SectionChips, { normalizeSectionsInput } from "./ui/SectionChips";

export default function UndertrialForm() {
  const [name, setName] = useState("");
  const [prisonerId, setPrisonerId] = useState("");
  const [sections, setSections] = useState("");
  const [timeServedYears, setTimeServedYears] = useState("");
  const [previousCriminalRecords, setPreviousCriminalRecords] = useState(0);
  const [flightRisk, setFlightRisk] = useState(0);
  const [witnessRisk, setWitnessRisk] = useState(0);

  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const sectionSuggestions = useSectionSuggestions(sections);

  const clearAll = () => {
    setName("");
    setPrisonerId("");
    setSections("");
    setTimeServedYears("");
    setPreviousCriminalRecords(0);
    setFlightRisk(0);
    setWitnessRisk(0);
    setResponse(null);
    setError(null);
    setCopied(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      name,
      prisonerId,
      sections: normalizeSectionsInput(sections),
      timeServedYears: Number(timeServedYears),
      previousCriminalRecords: Number(previousCriminalRecords),
      riskProfile: {
        flightRisk: Number(flightRisk),
        witnessRisk: Number(witnessRisk),
      },
    };

    try {
      setError(null);
      setLoading(true);
      const res = await createUndertrial(data);
      setResponse(res);
      setCopied(false);
    } catch (err) {
      console.error(err);
      setResponse(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = async () => {
    if (!response?._id) return;
    try {
      await navigator.clipboard.writeText(response._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      setError("Unable to copy ID. Please copy it manually.");
    }
  };

  return (
    <Card onClear={clearAll}>
      <p className="uiCardLead">Store a case and evaluate later by ID.</p>
      <form className="uiForm" onSubmit={handleSubmit}>
        <FormField label="Name">
          <Input
            placeholder="e.g., Rahul Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormField>

        <FormField label="Prisoner ID" hint="Must be unique">
          <Input
            placeholder="e.g., UP-2026-001"
            value={prisonerId}
            onChange={(e) => setPrisonerId(e.target.value)}
          />
        </FormField>

        <FormField label="Sections" hint="Comma-separated">
          <SectionChips
            value={sections}
            onChange={setSections}
            placeholder="IPC 420, IPC 379"
            suggestions={sectionSuggestions}
          />
        </FormField>

        <FormField label="Time served (years)" hint="Decimal allowed">
          <Input
            inputMode="decimal"
            placeholder="e.g., 1.5"
            value={timeServedYears}
            onChange={(e) => setTimeServedYears(e.target.value)}
          />
        </FormField>

        <FormField label="Previous criminal records" hint="Count of previous cases">
          <Input
            inputMode="numeric"
            placeholder="e.g., 0"
            value={previousCriminalRecords}
            onChange={(e) => setPreviousCriminalRecords(e.target.value)}
          />
        </FormField>

        <div className="uiGrid2">
          <RiskSlider label="Flight risk" value={flightRisk} onChange={setFlightRisk} />
          <RiskSlider label="Witness risk" value={witnessRisk} onChange={setWitnessRisk} />
        </div>

        <Button type="submit" loading={loading}>
          Create record
        </Button>
      </form>

      {error ? (
        <div className="uiAlert uiAlertError">
          <div className="uiAlertTitle">Could not create record</div>
          <div className="uiAlertBody">{error}</div>
        </div>
      ) : null}

      {response ? (
        <div className="uiAlert uiAlertOk">
          <div className="uiAlertTitle">Undertrial created</div>
          <div className="uiAlertBody">
            Save this ID for evaluation:
            <div style={{ marginTop: 8 }}>
              <code>{response._id}</code>
            </div>
            <div style={{ marginTop: 10 }}>
              <Button type="button" variant="secondary" onClick={handleCopyId}>
                {copied ? "Copied" : "Copy ID"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="uiEmptyHint" style={{ marginTop: 10 }}>
          After creation, use the ID in the “Evaluate Stored Undertrial” card.
        </div>
      )}
    </Card>
  );
}