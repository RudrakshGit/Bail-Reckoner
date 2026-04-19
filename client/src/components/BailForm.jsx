import { useEffect, useState } from "react";
import { evaluateBail, listLegalSections } from "../api/api";
import Card from "./ui/Card";
import Button from "./ui/Button";
import FormField from "./ui/FormField";
import Input from "./ui/Input";
import RiskSlider from "./ui/RiskSlider";
import SectionChips, { normalizeSectionsInput } from "./ui/SectionChips";
import StatusBadge from "./ui/StatusBadge";

export default function BailForm() {
  const [sections, setSections] = useState("");
  const [sectionSuggestions, setSectionSuggestions] = useState([]);
  const [timeServedYears, setTimeServedYears] = useState("");
  const [previousCriminalRecords, setPreviousCriminalRecords] = useState(0);
  const [flightRisk, setFlightRisk] = useState(0);
  const [witnessRisk, setWitnessRisk] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const highestSectionDetail = result?.sectionsEvaluated?.find(
    (x) => x.sectionNumber === result?.highestPunishmentSection
  );
  const highestSectionDescription = highestSectionDetail
    ? highestSectionDetail.description
      ? `${highestSectionDetail.offenceName} (i.e ${highestSectionDetail.description})`
      : highestSectionDetail.offenceName
    : "";
  const exceedsMaxPunishment =
    result?.maxPunishmentYears != null &&
    typeof result?.timeServedYears === "number" &&
    result.timeServedYears > result.maxPunishmentYears;

  const clearAll = () => {
    setSections("");
    setTimeServedYears("");
    setPreviousCriminalRecords(0);
    setFlightRisk(0);
    setWitnessRisk(0);
    setResult(null);
    setError(null);
  };

  useEffect(() => {
    let alive = true;
    const q = sections.split(",").slice(-1)[0]?.trim() || "";
    if (!q) {
      setSectionSuggestions([]);
      return;
    }
    listLegalSections(q)
      .then((items) => {
        if (!alive) return;
        setSectionSuggestions(items);
      })
      .catch(() => {
        if (!alive) return;
        setSectionSuggestions([]);
      });
    return () => {
      alive = false;
    };
  }, [sections]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      sections: normalizeSectionsInput(sections),
      timeServedYears: Number(timeServedYears),
      previousCriminalRecords: Number(previousCriminalRecords),
      flightRisk: Number(flightRisk),
      witnessRisk: Number(witnessRisk),
    };

    try {
      setError(null);
      setLoading(true);
      const res = await evaluateBail(data);
      setResult(res);
    } catch (err) {
      console.error(err);
      setResult(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stack">
      <Card onClear={clearAll}>
        <p className="uiCardLead">Evaluate eligibility instantly using statutory rules and risk factors.</p>
        <form className="uiForm" onSubmit={handleSubmit}>
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
              placeholder="e.g., 2"
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
            Evaluate
          </Button>
        </form>

        {error ? (
          <div className="uiAlert uiAlertError">
            <div className="uiAlertTitle">Could not evaluate</div>
            <div className="uiAlertBody">{error}</div>
          </div>
        ) : null}
      </Card>

      <Card title="Decision" subtitle="Eligibility and computed decision context.">
        {!result && !loading ? (
          <div className="uiEmpty">
            <div className="uiEmptyTitle">No evaluation yet</div>
            <div className="uiEmptyBody">
              Fill the form and click <b>Evaluate</b> to see the decision.
            </div>
          </div>
        ) : null}

        {result ? (
          <div className="uiResult">
            <div className="uiResultTop">
              <StatusBadge eligible={!!result.eligible} />
              <div className="uiResultReason">{result.reason}</div>
            </div>

            <div className="uiKv">
              <div className="uiKvRow">
                <div className="uiKvK">Highest section</div>
                <div className="uiKvV">
                  <code>{result.highestPunishmentSection}</code>
                </div>
              </div>
              {highestSectionDescription ? (
                <div className="uiKvRow">
                  <div className="uiKvK">Description</div>
                  <div className="uiKvV uiKvVClamp">{highestSectionDescription}</div>
                </div>
              ) : null}
              <div className="uiKvRow">
                <div className="uiKvK">Max punishment</div>
                <div className="uiKvV">
                  {result.maxPunishmentYears == null
                    ? "Not applicable (Life/Death punishment profile)"
                    : `${result.maxPunishmentYears} years`}
                </div>
              </div>
              <div className="uiKvRow">
                <div className="uiKvK">Half-term</div>
                <div className="uiKvV">
                  {result.halfTerm == null ? "Not applicable" : `${result.halfTerm} years`}
                </div>
              </div>
              <div className="uiKvRow">
                <div className="uiKvK">Risk score</div>
                <div className="uiKvV">{result.riskScore}</div>
              </div>
              <div className="uiKvRow">
                <div className="uiKvK">Previous records</div>
                <div className="uiKvV">{result.previousCriminalRecords ?? 0}</div>
              </div>
            </div>

            {exceedsMaxPunishment ? (
              <div className="uiAlert uiAlertOk">
                <div className="uiAlertTitle">Note</div>
                <div className="uiAlertBody">
                  Time served is higher than the listed maximum punishment for the selected highest section.
                </div>
              </div>
            ) : null}

            {result.proceduralRequirements ? (
              <div className="uiPills">
                <span className="uiPill">
                  Surety: {result.proceduralRequirements.requiresSurety ? "Required" : "Not required"}
                </span>
                <span className="uiPill">
                  Personal bond: {result.proceduralRequirements.allowsPersonalBond ? "Allowed" : "Not allowed"}
                </span>
                <span className="uiPill">
                  Fine: {result.proceduralRequirements.fineApplicable ? "Applicable" : "Not applicable"}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}
      </Card>
    </div>
  );
}