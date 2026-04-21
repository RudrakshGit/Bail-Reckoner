export default function AboutPage({ onBack }) {
  return (
    <section className="aboutPage">
      <article className="aboutPageCard">
        <h1 className="aboutPageTitle">About Bail Reckoner</h1>

        <p className="aboutPageText">
          Bail Reckoner is a deterministic, rule-based legal-tech application designed to evaluate bail eligibility using
          statutory sections, time served, and judicial risk factors.
        </p>

        <p className="aboutPageText">
          The platform provides three core workflows: direct bail evaluation, undertrial record creation, and evaluation
          of stored undertrial records by ID.
        </p>

        <p className="aboutPageText">
          It is built to make bail-assessment logic transparent, structured, and easy to review for educational and
          workflow-support use cases.
        </p>

        {/* Document Buttons */}
        <div className="docButtons">
          <a
            href="/docs/Bail_Reckoner_Documentation_v3.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="docBtn"
          >
            View Documentation
          </a>

          <a
            href="/docs/Synopsis.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="docBtn"
          >
            View Project Synopsis
          </a>
        </div>
      </article>
    </section>
  );
}