import BailForm from "./components/BailForm";
import UndertrialForm from "./components/UndertrialForm";
import UndertrialEvaluation from "./components/UndertrialEvaluation";
import AboutPage from "./components/AboutPage";
import ExportEvaluationModal from "./components/ExportEvaluationModal";
import ThemeToggle from "./components/ThemeToggle";
import "./App.css";
import { useCallback, useEffect, useMemo, useState } from "react";

const THEME_KEY = "bail-reckoner-theme";

const FEEDBACK_EMAIL = "rudrakshwillnotreply@gmail.com";
const DEFAULT_REPO_URL = "https://github.com/RudrakshGit/Bail-Reckoner";
const REPO_URL = (import.meta.env.VITE_REPO_URL || DEFAULT_REPO_URL).trim();

const SECTION_IDS = {
  bail: "section-bail",
  create: "section-create",
  evaluate: "section-evaluate",
};

const TOOLS_ROOT_ID = "section-tools";

const SECTION_ID_TO_INDEX = {
  [SECTION_IDS.bail]: 0,
  [SECTION_IDS.create]: 1,
  [SECTION_IDS.evaluate]: 2,
};

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");
  const [toolIndex, setToolIndex] = useState(0);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    try {
      const v = window.localStorage.getItem(THEME_KEY);
      return v === "light" || v === "dark" ? v : "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const toolPages = useMemo(
    () => [
      {
        id: SECTION_IDS.bail,
        title: "Direct Bail Evaluation",
        node: <BailForm />,
      },
      {
        id: SECTION_IDS.create,
        title: "Create Undertrial Record",
        node: <UndertrialForm />,
      },
      {
        id: SECTION_IDS.evaluate,
        title: "Evaluate Stored Undertrial",
        node: <UndertrialEvaluation />,
      },
    ],
    []
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (exportModalOpen) setExportModalOpen(false);
      else setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exportModalOpen]);

  const goToSection = useCallback((id) => {
    setCurrentPage("home");
    setDrawerOpen(false);
    const idx = SECTION_ID_TO_INDEX[id];
    if (typeof idx === "number") setToolIndex(idx);
    requestAnimationFrame(() => {
      document.getElementById(TOOLS_ROOT_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const goHome = () => {
    setCurrentPage("home");
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toolCount = toolPages.length;
  const canPrev = toolIndex > 0;
  const canNext = toolIndex < toolCount - 1;
  const prev = () => setToolIndex((i) => Math.max(0, i - 1));
  const next = () => setToolIndex((i) => Math.min(toolCount - 1, i + 1));

  const currentTitle = toolPages[toolIndex]?.title ?? "";
  const prevTitle = toolPages[toolIndex - 1]?.title ?? "";
  const nextTitle = toolPages[toolIndex + 1]?.title ?? "";

  return (
    <div className="app">
      <nav className="menuBar">
        <button
          className="menuLogo"
          type="button"
          onClick={goHome}
          aria-label="Go to top"
        >
          <img className="menuHomeIconImg" src="/home.png" alt="" aria-hidden="true" />
        </button>

        <div className="menuBarRight">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <button className="menuBtn" type="button" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <span className="menuIcon" />
          </button>
        </div>
      </nav>

      {drawerOpen ? (
        <div className="drawerOverlay" onClick={() => setDrawerOpen(false)} role="presentation">
          <aside className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawerTop">
              <div className="drawerTitle">Menu</div>
              <button className="drawerClose" type="button" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                ✕
              </button>
            </div>

            <div className="drawerGroup">
              <div className="drawerGroupLabel" id="drawer-tools-heading">
                Tools
              </div>
              <div className="drawerSection" role="group" aria-labelledby="drawer-tools-heading">
                <button className="drawerItem" type="button" onClick={() => goToSection(SECTION_IDS.bail)}>
                  Direct Bail Evaluation
                  <span className="drawerHint">Statutory rules and risk factors</span>
                </button>
                <button className="drawerItem" type="button" onClick={() => goToSection(SECTION_IDS.create)}>
                  Create Undertrial Record
                  <span className="drawerHint">Save a case for later</span>
                </button>
                <button className="drawerItem" type="button" onClick={() => goToSection(SECTION_IDS.evaluate)}>
                  Evaluate Stored Undertrial
                  <span className="drawerHint">Load by ID and persist decision</span>
                </button>
              </div>
            </div>

            <div className="drawerGroup">
              <div className="drawerGroupLabel" id="drawer-help-heading">
                Help
              </div>
              <div className="drawerSection" role="group" aria-labelledby="drawer-help-heading">
                <button
                  className="drawerItem"
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    setCurrentPage("about");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  About this app
                  <span className="drawerHint">What Bail Reckoner does</span>
                </button>
              </div>
            </div>

            <div className="drawerGroup">
              <div className="drawerGroupLabel" id="drawer-other-heading">
                Other
              </div>
              <div className="drawerSection" role="group" aria-labelledby="drawer-other-heading">
                <button
                  className="drawerItem"
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    setExportModalOpen(true);
                  }}
                >
                  Export evaluation by ID
                  <span className="drawerHint">Download stored undertrial as JSON</span>
                </button>
                <button
                  className="drawerItem"
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    window.open(REPO_URL, "_blank", "noopener,noreferrer");
                  }}
                >
                  GitHub Repository
                  <span className="drawerHint">Opens the GitHub project in a new tab</span>
                </button>
                <button
                  className="drawerItem"
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    window.location.href = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent("Bail Reckoner feedback")}`;
                  }}
                >
                  Send feedback
                  <span className="drawerHint">Tell us what you think</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      <ExportEvaluationModal open={exportModalOpen} onClose={() => setExportModalOpen(false)} />

      <main className="container">
        {currentPage === "about" ? (
          <AboutPage onBack={goHome} />
        ) : (
          <>
            <section className="heroSection" aria-label="Introduction">
              <div className="heroOrb" />
              <div className="heroLogoWrap">
                <img className="heroLogo" src="/logo.jpg" alt="Bail Reckoner logo" />
              </div>

              <div className="heroContent">
                <p className="heroSubtitle">
                  With precision, insight, and dedication, we simplify complex bail eligibility workflows.
                </p>
              </div>

              <div className="scrollHint">
                <span>Scroll Down</span>
                <span className="scrollHintArrow">↓</span>
              </div>
            </section>

            <section className="homeToolsSection" id={TOOLS_ROOT_ID} aria-label="Application tools">
              <div className="toolsCarouselTop">
                <h2 className="toolsCarouselHeading">{currentTitle}</h2>
                <span className="toolsCarouselProgress" aria-live="polite">
                  {toolIndex + 1} / {toolCount}
                </span>
              </div>

              <div className="toolsCarousel">
                <button
                  className="toolsCarouselArrow"
                  type="button"
                  onClick={prev}
                  disabled={!canPrev}
                  aria-label="Previous tool"
                >
                  ←
                </button>

                <div className="toolsCarouselViewport">
                  <div
                    className="toolsCarouselTrack"
                    style={{ transform: `translateX(-${toolIndex * 100}%)` }}
                  >
                    {toolPages.map((page) => (
                      <article
                        key={page.id}
                        className="toolsCarouselSlide"
                        id={page.id}
                        aria-label={page.title}
                      >
                        {page.node}
                      </article>
                    ))}
                  </div>
                </div>

                <button
                  className="toolsCarouselArrow"
                  type="button"
                  onClick={next}
                  disabled={!canNext}
                  aria-label="Next tool"
                >
                  →
                </button>
              </div>

              <div className="toolsCarouselMeta" role="group" aria-label="Previous, current, and next tool">
                <div className="toolsCarouselMetaItem toolsCarouselMetaPrev">
                  <button
                    type="button"
                    className="toolsCarouselMetaBtn toolsCarouselMetaBtnSide"
                    disabled={!canPrev}
                    onClick={prev}
                    aria-label={prevTitle ? `Open previous: ${prevTitle}` : "No previous tool"}
                  >
                    <span className="toolsCarouselMetaValue">{prevTitle || "—"}</span>
                  </button>
                </div>
                <div className="toolsCarouselMetaItem toolsCarouselMetaCurrent">
                  <button
                    type="button"
                    className="toolsCarouselMetaBtn toolsCarouselMetaBtnCurrent"
                    onClick={() =>
                      document.getElementById(TOOLS_ROOT_ID)?.scrollIntoView({ behavior: "smooth", block: "start" })
                    }
                    aria-label={`Current tool: ${currentTitle}. Scroll tools into view.`}
                  >
                    <span className="toolsCarouselMetaValue">{currentTitle}</span>
                  </button>
                </div>
                <div className="toolsCarouselMetaItem toolsCarouselMetaNext">
                  <button
                    type="button"
                    className="toolsCarouselMetaBtn toolsCarouselMetaBtnSide"
                    disabled={!canNext}
                    onClick={next}
                    aria-label={nextTitle ? `Open next: ${nextTitle}` : "No next tool"}
                  >
                    <span className="toolsCarouselMetaValue">{nextTitle || "—"}</span>
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
