import { useState } from "react";
import { evaluateUndertrial } from "../api/api";
import Card from "./ui/Card";
import Button from "./ui/Button";
import FormField from "./ui/FormField";
import Input from "./ui/Input";
import StatusBadge from "./ui/StatusBadge";

export default function UndertrialEvaluation() {
  const [id, setId] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const clearAll = () => {
    setId("");
    setResult(null);
    setError(null);
  };

  const handleEvaluate = async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await evaluateUndertrial(id);
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
    <Card onClear={clearAll}>
      <p className="uiCardLead">Fetch a stored case by ID, evaluate, and persist the decision.</p>
      <div className="uiForm">
        <FormField label="Undertrial ID" hint="Mongo ObjectId">
          <Input
            placeholder="e.g., 6614c2…"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
        </FormField>

        <Button onClick={handleEvaluate} disabled={!id.trim()} loading={loading}>
          Evaluate record
        </Button>
      </div>

      {error ? (
        <div className="uiAlert uiAlertError">
          <div className="uiAlertTitle">Could not evaluate record</div>
          <div className="uiAlertBody">{error}</div>
        </div>
      ) : null}

      {!result && !loading ? (
        <div className="uiEmpty">
          <div className="uiEmptyTitle">Waiting for an ID</div>
          <div className="uiEmptyBody">Create an undertrial record first, then paste its ID here.</div>
        </div>
      ) : null}

      {result ? (
        <div className="uiResult">
          <div className="uiResultTop">
            <StatusBadge eligible={!!result?.evaluation?.eligible} />
            <div className="uiResultReason">{result?.evaluation?.reason}</div>
          </div>

          <div className="uiKv">
            <div className="uiKvRow">
              <div className="uiKvK">Name</div>
              <div className="uiKvV">{result?.undertrial?.name}</div>
            </div>
            <div className="uiKvRow">
              <div className="uiKvK">Prisoner ID</div>
              <div className="uiKvV">
                <code>{result?.undertrial?.prisonerId}</code>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}