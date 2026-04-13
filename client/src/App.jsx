import BailForm from "./components/BailForm";
import UndertrialForm from "./components/UndertrialForm";
import UndertrialEvaluation from "./components/UndertrialEvaluation";
import "./App.css";
import Carousel from "./components/ui/Carousel";
import { motion, useMotionTemplate, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [activeCard, setActiveCard] = useState(0);
  const contentRef = useRef(null);

  const { scrollY } = useScroll();

  // Timeline (px):
  // 0-220: logo completes one full rotation
  // 220-340: cards rise in
  // 280+: logo/hero gets blurred behind the card layer
  const logoRotateY = useTransform(scrollY, [0, 220], [0, 360]);
  const logoScale = useTransform(scrollY, [0, 220], [1, 0.82]);
  const logoOpacity = useTransform(scrollY, [0, 220, 420], [1, 0.88, 0.58]);
  const heroBgRotate = useTransform(scrollY, [0, 380], [0, 24]);
  const heroBgScale = useTransform(scrollY, [0, 380], [1, 1.12]);
  const heroTextOpacity = useTransform(scrollY, [0, 220], [1, 0]);
  const heroTextY = useTransform(scrollY, [0, 240], [0, -44]);
  const contentY = useTransform(scrollY, [220, 420], [420, 0]);
  const contentOpacity = useTransform(scrollY, [220, 300], [0, 1]);
  const logoBlurPx = useTransform(scrollY, [280, 460], [0, 10]);
  const heroBlur = useMotionTemplate`blur(${logoBlurPx}px)`;

  const goToCard = (idx) => {
    setActiveCard(idx);
    setDrawerOpen(false);
    requestAnimationFrame(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="app">
      <nav className="menuBar">
        <button className="menuLogo" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <img src="/home.png" alt="Home" />
        </button>

        <button className="menuBtn" type="button" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
          <span className="menuIcon" />
        </button>
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

            <div className="drawerSection">
              <button className="drawerItem" type="button" onClick={() => goToCard(0)}>
                Bail Eligibility
                <span className="drawerHint">Direct evaluation</span>
              </button>
              <button className="drawerItem" type="button" onClick={() => goToCard(1)}>
                Create Undertrial
                <span className="drawerHint">Save case in DB</span>
              </button>
              <button className="drawerItem" type="button" onClick={() => goToCard(2)}>
                Evaluate Undertrial
                <span className="drawerHint">Evaluate by ID</span>
              </button>
            </div>

            <div className="drawerSection">
              <button
                className="drawerItem"
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  setAboutOpen(true);
                }}
              >
                Help?
                <span className="drawerHint">What this app does</span>
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      {aboutOpen ? (
        <div className="drawerOverlay" onClick={() => setAboutOpen(false)} role="presentation">
          <aside className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawerTop">
              <div className="drawerTitle">About Bail Reckoner</div>
              <button className="drawerClose" type="button" onClick={() => setAboutOpen(false)} aria-label="Close about">
                ✕
              </button>
            </div>
            <div className="aboutBody">
              <p>
                Bail Reckoner is a deterministic, rule-based legal-tech tool designed to evaluate bail eligibility for
                undertrial cases using statutory sections, time served, and judicial risk factors.
              </p>
              <p className="aboutMuted">
                This interface supports direct bail evaluation and a full undertrial workflow: create a record, then
                evaluate by ID.
              </p>
              <button className="aboutBtn" type="button" onClick={() => setAboutOpen(false)}>
                Close
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      <main className="container">
        <section className="heroSection">
          <motion.div
            className="heroOrb"
            style={{
              rotate: heroBgRotate,
              scale: heroBgScale,
              filter: heroBlur,
            }}
          />
          <motion.div
            className="heroLogoWrap"
            style={{
              rotateY: logoRotateY,
              scale: logoScale,
              opacity: logoOpacity,
              filter: heroBlur,
              transformPerspective: 1100,
            }}
          >
            <img className="heroLogo" src="/logo.jpg" alt="Bail Reckoner logo" />
          </motion.div>

          <motion.div
            className="heroContent"
            style={{
              opacity: heroTextOpacity,
              y: heroTextY,
            }}
          >
            <h2 className="heroTitle">Bail Reckoner</h2>
            <p className="heroSubtitle">
              With precision, insight, and dedication, we simplify complex bail eligibility workflows.
            </p>
          </motion.div>

          <motion.div
            className="scrollHint"
            style={{
              opacity: heroTextOpacity,
            }}
          >
            <span>Scroll Down</span>
            <span className="scrollHintArrow">↓</span>
          </motion.div>
        </section>

        <motion.section
          className="contentSection"
          ref={contentRef}
          style={{
            y: contentY,
            opacity: contentOpacity,
          }}
        >
          <Carousel
            index={activeCard}
            onIndexChange={setActiveCard}
            pages={[
              {
                key: "bail",
                title: "Direct Bail Evaluation",
                subtitle: "Evaluate eligibility instantly using statutory rules and risk factors.",
                node: <BailForm />,
              },
              {
                key: "create",
                title: "Create Undertrial Record",
                subtitle: "Store a case and evaluate later by ID.",
                node: <UndertrialForm />,
              },
              {
                key: "evaluate",
                title: "Evaluate Stored Undertrial",
                subtitle: "Fetch a stored case by ID, evaluate, and persist the decision.",
                node: <UndertrialEvaluation />,
              },
            ]}
          />
        </motion.section>
      </main>
    </div>
  );
}

export default App;