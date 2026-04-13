import { useMemo, useRef, useState } from "react";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function Carousel({ pages, initialIndex = 0, index, onIndexChange }) {
  const [internalIndex, setInternalIndex] = useState(clamp(initialIndex, 0, pages.length - 1));
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startXRef = useRef(0);
  const activeIdRef = useRef(null);

  const currentIndex = index ?? internalIndex;
  const canBack = currentIndex > 0;
  const canNext = currentIndex < pages.length - 1;

  const title = useMemo(() => pages[currentIndex]?.title ?? "", [pages, currentIndex]);
  const prevTitle = useMemo(() => pages[currentIndex - 1]?.title ?? "", [pages, currentIndex]);
  const nextTitle = useMemo(() => pages[currentIndex + 1]?.title ?? "", [pages, currentIndex]);

  const go = (nextIndex) => {
    const clamped = clamp(nextIndex, 0, pages.length - 1);
    if (typeof onIndexChange === "function") onIndexChange(clamped);
    if (index === undefined) setInternalIndex(clamped);
  };
  const back = () => canBack && go(currentIndex - 1);
  const next = () => canNext && go(currentIndex + 1);

  const onPointerDown = (e) => {
    // Only left click / primary contact
    if (e.pointerType === "mouse" && e.button !== 0) return;

    // Do not hijack clicks on interactive controls inside forms/cards.
    const interactive = e.target.closest(
      "button, input, textarea, select, label, a, [role='button'], [contenteditable='true']"
    );
    if (interactive) return;

    activeIdRef.current = e.pointerId;
    startXRef.current = e.clientX;
    setDragging(true);
    setDragX(0);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragging || activeIdRef.current !== e.pointerId) return;
    const dx = e.clientX - startXRef.current;
    setDragX(dx);
  };

  const endDrag = () => {
    if (!dragging) return;
    const threshold = 80;
    if (dragX <= -threshold) next();
    else if (dragX >= threshold) back();
    setDragging(false);
    setDragX(0);
    activeIdRef.current = null;
  };

  const onPointerUp = (e) => {
    if (activeIdRef.current !== e.pointerId) return;
    endDrag();
  };

  const onPointerCancel = (e) => {
    if (activeIdRef.current !== e.pointerId) return;
    endDrag();
  };

  const trackStyle = {
    transform: `translateX(calc(${-currentIndex * 100}% + ${dragX}px))`,
    transition: dragging ? "none" : undefined,
  };

  return (
    <div className="carousel">
      <div className="carouselTop">
        <div className="carouselTitleRow">
          <div className="carouselTitle">{title}</div>
          <div className="carouselProgress">
            {currentIndex + 1}/{pages.length}
          </div>
        </div>
      </div>

      <div
        className="carouselViewport"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        <div className="carouselTrack" style={trackStyle}>
          {pages.map((p) => (
            <div className="carouselSlide" key={p.key}>
              <div className="carouselCard">{p.node}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="carouselControls">
        <button
          className="carouselArrow"
          type="button"
          onClick={back}
          disabled={!canBack}
          aria-label="Back"
          title="Back"
        >
          ←
        </button>

        <div className="carouselMeta" aria-live="polite">
          <div className="carouselMetaItem carouselMetaItemPrev">
            <span className="carouselMetaValue">{prevTitle}</span>
          </div>
          <div className="carouselMetaItem carouselMetaItemCurrent">
            <span className="carouselMetaValue">{title}</span>
          </div>
          <div className="carouselMetaItem carouselMetaItemNext">
            <span className="carouselMetaValue">{nextTitle}</span>
          </div>
        </div>

        <button
          className="carouselArrow"
          type="button"
          onClick={next}
          disabled={!canNext}
          aria-label="Next"
          title="Next"
        >
          →
        </button>
      </div>
    </div>
  );
}

