// ResearchPortfolio.jsx
import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import "./Portfolio.css";

// ─── JSON DATA IMPORTS ────────────────────────────────────────────────────────
import publications from "./data/publications.json";
import experience   from "./data/experience.json";
import education    from "./data/education.json";
import awards       from "./data/achievements.json";
import certificates from "./data/certificates.json";
import gallery from "./data/gallery.json";

// Research interests — UI metadata with icons, kept in component
const researchInterests = [
  
  { label: "IoT & Embedded Systems",                    icon: "🔌" },
  { label: "Artificial Intelligence & Machine Learning", icon: "🧠" },
  { label: "Edge Computing",                             icon: "⚡" },
  { label: "Human-Computer Interaction",                icon: "🖥️" },
  { label: "Cloud Cmputing",               icon: "☁️" },
];

// ─── TRANSLATION ──────────────────────────────────────────────────────────────
const translateText = async (text, targetLang) => {
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    );
    const data = await res.json();
    return data[0].map((item) => item[0]).join("");
  } catch {
    return text;
  }
};

const translatePage = async (targetLang) => {
  const els = document.querySelectorAll("h1, h2, h3, p, li, button");
  for (const el of els) {
    const orig = el.innerText.trim();
    if (orig && orig.length < 500) {
      el.innerText = await translateText(orig, targetLang);
    }
  }
};

// ─── NORMALISE item from any JSON shape ───────────────────────────────────────
const normaliseItem = (item, srcKey, titleKey, captionKey) => ({
  src:     item[srcKey]     || item.src     || item.image || "",
  title:   item[titleKey]   || item.title   || "",
  caption: item[captionKey] || item.caption || item.description || item.issuer || "",
});

// ─── LIGHTBOX — rendered via Portal onto document.body ────────────────────────
// This completely escapes any parent overflow / stacking context.
function Lightbox({ images, startIndex, srcKey, titleKey, captionKey, onClose }) {
  const [idx, setIdx]     = useState(startIndex);
  const touchStartX       = useRef(null);
  const item              = normaliseItem(images[idx], srcKey, titleKey, captionKey);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape")                                  onClose();
      if (e.key === "ArrowRight" && idx < images.length - 1)  setIdx((i) => i + 1);
      if (e.key === "ArrowLeft"  && idx > 0)                   setIdx((i) => i - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, images.length, onClose]);

  const modal = (
    <div
      className="lb-overlay"
      onClick={onClose}
      onTouchStart={(e) => (touchStartX.current = e.changedTouches[0].screenX)}
      onTouchEnd={(e) => {
        const diff = touchStartX.current - e.changedTouches[0].screenX;
        if (diff >  50 && idx < images.length - 1) setIdx((i) => i + 1);
        if (diff < -50 && idx > 0)                 setIdx((i) => i - 1);
      }}
    >
      {/* Close button */}
      <button className="lb-close" onClick={onClose} aria-label="Close">✕</button>

      {/* Prev */}
      {idx > 0 && (
        <button
          className="lb-nav lb-prev"
          onClick={(e) => { e.stopPropagation(); setIdx((i) => i - 1); }}
          aria-label="Previous"
        >‹</button>
      )}

      {/* Image + caption */}
      <div className="lb-content" onClick={(e) => e.stopPropagation()}>
        <img src={item.src} alt={item.title || item.caption} className="lb-img" />
        {(item.title || item.caption) && (
          <div className="lb-caption">
            {item.title   && <strong>{item.title}</strong>}
            {item.caption && <span>{item.caption}</span>}
          </div>
        )}
        <p className="lb-counter">{idx + 1} / {images.length}</p>
      </div>

      {/* Next */}
      {idx < images.length - 1 && (
        <button
          className="lb-nav lb-next"
          onClick={(e) => { e.stopPropagation(); setIdx((i) => i + 1); }}
          aria-label="Next"
        >›</button>
      )}
    </div>
  );

  // Portal: render directly on <body>, outside all React tree stacking contexts
  return ReactDOM.createPortal(modal, document.body);
}

// ─── CAROUSEL ─────────────────────────────────────────────────────────────────
function Carousel({ id, title, items, srcKey = "src", titleKey = "title", captionKey = "caption" }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const trackRef   = useRef(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);
  const didDrag    = useRef(false); // distinguish drag from click

  const onMouseDown = (e) => {
    isDragging.current   = true;
    didDrag.current      = false;
    dragStartX.current   = e.pageX - trackRef.current.offsetLeft;
    dragScrollLeft.current = trackRef.current.scrollLeft;
    trackRef.current.style.cursor = "grabbing";
  };

  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x    = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - dragStartX.current) * 1.2;
    if (Math.abs(walk) > 5) didDrag.current = true;
    trackRef.current.scrollLeft = dragScrollLeft.current - walk;
  };

  const stopDrag = () => {
    isDragging.current = false;
    if (trackRef.current) trackRef.current.style.cursor = "grab";
  };

  const handleCardClick = (i) => {
    // Only open lightbox if not dragging
    if (!didDrag.current) setLightboxIndex(i);
  };

  return (
    <section className="rp-section" id={id}>
      <SectionHeading>{title}</SectionHeading>

      <div
        className="carousel-track"
        ref={trackRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        {items.map((item, i) => {
          const norm = normaliseItem(item, srcKey, titleKey, captionKey);
          return (
            <div
              key={i}
              className="carousel-card"
              onClick={() => handleCardClick(i)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setLightboxIndex(i)}
              aria-label={norm.title || norm.caption || `Image ${i + 1}`}
            >
              <div className="carousel-img-wrap">
                <img
                  src={norm.src}
                  alt={norm.title || norm.caption}
                  loading="lazy"
                  draggable="false"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentElement.classList.add("img-error");
                  }}
                />
                <div className="carousel-overlay">
                  <span className="zoom-icon">⊕</span>
                </div>
              </div>
              {(norm.title || norm.caption) && (
                <div className="carousel-caption">
                  {norm.title   && <strong>{norm.title}</strong>}
                  {norm.caption && <span>{norm.caption}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightbox rendered via Portal — completely outside this DOM tree */}
      {lightboxIndex !== null && (
        <Lightbox
          images={items}
          startIndex={lightboxIndex}
          srcKey={srcKey}
          titleKey={titleKey}
          captionKey={captionKey}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </section>
  );
}

// ─── SECTION HEADING ──────────────────────────────────────────────────────────
function SectionHeading({ children }) {
  return (
    <div className="section-heading">
      <h2>{children}</h2>
      <div className="heading-rule" />
    </div>
  );
}

// ─── ROOT COMPONENT ───────────────────────────────────────────────────────────
export default function ResearchPortfolio() {
  const [pubFilter, setPubFilter] = useState("all");
  const [theme,     setTheme]     = useState("light");
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const filteredPubs =
    pubFilter === "all"
      ? publications
      : publications.filter((p) => p.type === pubFilter);

  const pubTypes = ["all", "Conference Paper", "Journal Article", "Book", "Patent"];

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const navLinks = [
    { id: "about",        label: "About"        },
    { id: "experience",   label: "Experience"   },
    { id: "education",    label: "Education"    },
    { id: "interests",    label: "Research"     },
    { id: "publications", label: "Publications" },
    { id: "awards",       label: "Awards"       },
    { id: "certificates", label: "Certificates" },
    { id: "gallery",      label: "Gallery"      },
  ];

  return (
    <>
      {/* ══════════════════════════════════ HEADER ══ */}
      <header className="rp-header">
        <div className="header-inner">

          <div className="header-brand" onClick={() => scrollTo("about")}>
            <span className="brand-initials">CH</span>
            <span className="brand-name">Chandramouli Haldar</span>
          </div>

          <nav className={`header-nav${menuOpen ? " open" : ""}`}>
            {navLinks.map((l) => (
              <button key={l.id} className="nav-item" onClick={() => scrollTo(l.id)}>
                {l.label}
              </button>
            ))}
          </nav>

          <div className="header-controls">
            <div className="lang-flags">
              <img
                src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg"
                alt="English" title="English"
                onClick={() => window.location.reload()}
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/en/9/9e/Flag_of_Japan.svg"
                alt="日本語" title="Japanese"
                onClick={() => translatePage("ja")}
              />
            </div>
            <button
              className="theme-toggle"
              onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
              title="Toggle theme"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
            <button
              className="hamburger"
              onClick={() => setMenuOpen((m) => !m)}
              aria-label="Menu"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>

        </div>
      </header>

      {/* ══════════════════════════════════ LAYOUT ══ */}
      <div className="rp-layout">

        {/* ════════════════ SIDEBAR ════ */}
        <aside className="rp-sidebar">

          <div className="profile-photo-wrap">
            <img
              src="/img/dp.png"
              alt="Chandramouli Haldar"
              className="profile-photo"
              onError={(e) => {
                e.target.src =
                  "https://api.dicebear.com/7.x/initials/svg?seed=CH&backgroundColor=1b2d4f&textColor=ffffff&fontSize=38";
              }}
            />
          </div>

          <h1 className="sidebar-name">Chandramouli Haldar</h1>
          <p className="sidebar-title">Student · Researcher · Innovator</p>
          <p className="sidebar-sub">Bridging Hardware &amp; Software</p>

          <hr className="sidebar-divider" />

          <div className="sidebar-meta">
            <div className="meta-row"><span>📍</span><span>Kolkata, India</span></div>
          </div>

          <div className="sidebar-stats">
            <div className="stat-item">
              <span className="stat-val">10+</span>
              <span className="stat-lbl">Publications</span>
            </div>
            <div className="stat-div" />
            <div className="stat-item">
              <span className="stat-val">3+</span>
              <span className="stat-lbl">Yrs Exp</span>
            </div>
            <div className="stat-div" />
            <div className="stat-item">
              <span className="stat-val">2</span>
              <span className="stat-lbl">Countries</span>
            </div>
          </div>

          <hr className="sidebar-divider" />

          <nav className="sidebar-links">
            <a href="mailto:Chandramoulihaldar@gmail.com" className="s-link">
              <span className="s-icon">✉</span>
              <span className="s-label">Chandramoulihaldar@gmail.com</span>
            </a>
            <a href="mailto:chandramouli@novatech-is.in" className="s-link">
              <span className="s-icon">✉</span>
              <span className="s-label">chandramouli@novatech-is.in</span>
            </a>
            <a href="https://www.linkedin.com/in/chandramouli01/" target="_blank" rel="noreferrer" className="s-link">
              <span className="s-icon s-li">in</span>
              <span className="s-label">LinkedIn Profile</span>
            </a>
            <a href="https://github.com/Chandramouli001" target="_blank" rel="noreferrer" className="s-link">
              <span className="s-icon">⌥</span>
              <span className="s-label">GitHub — Chandramouli001</span>
            </a>
            <a href="https://www.youtube.com/@Chandram0uli" target="_blank" rel="noreferrer" className="s-link">
              <span className="s-icon">▶</span>
              <span className="s-label">YouTube Channel</span>
            </a>
            <a href="https://scholar.google.com/citations?user=VXo1zqUAAAAJ&hl=en&oi=ao" target="_blank" rel="noreferrer" className="s-link">
              <span className="s-icon">🎓</span>
              <span className="s-label">Google Scholar</span>
            </a>
            <a href="https://orcid.org/0009-0004-9759-194X" target="_blank" rel="noreferrer" className="s-link">
              <span className="s-icon s-orcid">iD</span>
              <span className="s-label">ORCID: 0009-0004-9759-194X</span>
            </a>
            <a href="https://www.researchgate.net/profile/Chandramouli-Haldar-4" target="_blank" rel="noreferrer" className="s-link">
              <span className="s-icon s-rg">RG</span>
              <span className="s-label">ResearchGate Profile</span>
            </a>
          </nav>

        </aside>

        {/* ════════════════ MAIN ═══════ */}
        <main className="rp-main">

          {/* ABOUT */}
          <section className="rp-section" id="about">
            <SectionHeading>About</SectionHeading>
          <div className="bio-text">
  <p>
    Chandramouli Haldar has a strong passion for bridging hardware and software domains.
    He has completed a <strong>Bachelor of Technology in Computer Science &amp; Engineering</strong> along with a{" "}
    <strong>Diploma in Electronics &amp; Telecommunication Engineering</strong>, which makes him confident
    in both hardware and software technologies and enables him to work across multidisciplinary engineering fields.
  </p>

  <p>
    His research interests include <strong>Internet of Things (IoT), Edge Computing, Artificial Intelligence, Machine Learning, UAV systems, smart healthcare technologies, and intelligent automation</strong>.
    His work focuses on integrating intelligent systems with real-world applications to build efficient and scalable solutions.
  </p>

  <p>
    He has international academic exposure through a research internship at the{" "}
    <strong>Asian Institute of Technology (AIT), Bangkok, Thailand</strong>, where he contributed to multiple
    projects including prompt engineering, QGIS workflows, and geospatial data analysis.
    He also received the <strong>Best Project Award</strong> for a carbon emission reduction idea.
    This experience strengthened his approach toward international research and practical innovation.
  </p>

  <p>
    He is actively engaged in technical education, providing training to college students in different domains
    such as <strong>MongoDB, web development, and VLSI</strong>.
    Along with this, he is the <strong>Founder and CEO of NovaTech Innovative Solutions</strong>,
    where he leads the development of software and hardware-based solutions.
  </p>

  <p>
    With a strong inclination toward innovation and entrepreneurship, Chandramouli is an enthusiastic learner
    of the Japanese language, inspired by Japan’s unique balance of cultural heritage and advanced technological progress.
  </p>
</div>
          </section>

          {/* EXPERIENCE */}
          <section className="rp-section" id="experience">
            <SectionHeading>Professional Experience</SectionHeading>
            <div className="timeline">
              {experience.map((exp, i) => (
                <div key={i} className="tl-item">
                  <div className="tl-marker">
                    <div className="tl-dot" />
                    {i < experience.length - 1 && <div className="tl-line" />}
                  </div>
                  <div className="tl-body">
                    <div className="tl-top">
                      <div>
                        <h3 className="tl-role">{exp.role}</h3>
                        <p className="tl-org">{exp.organization}</p>
                      </div>
                      <span className="tl-year">{exp.year}</span>
                    </div>
                    <p className="tl-desc">{exp.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* EDUCATION */}
          <section className="rp-section" id="education">
            <SectionHeading>Education</SectionHeading>
            <div className="edu-list">
              {education.map((edu, i) => (
                <div key={i} className="edu-card">
                  <div className="edu-icon">🎓</div>
                  <div className="edu-info">
                    <h3 className="edu-degree">{edu.degree}</h3>
                    <p className="edu-inst">{edu.institution}</p>
                    <div className="edu-pills">
                      <span className="pill pill-yr">{edu.year}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* RESEARCH INTERESTS */}
          <section className="rp-section" id="interests">
            <SectionHeading>Research Interests</SectionHeading>
            <div className="interest-grid">
              {researchInterests.map((r, i) => (
                <div key={i} className="interest-tag">
                  <span>{r.icon}</span>
                  <span>{r.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* PUBLICATIONS */}
          <section className="rp-section" id="publications">
            <SectionHeading>Publications</SectionHeading>
            <div className="pub-filters">
              {pubTypes.map((t) => (
                <button
                  key={t}
                  className={`pub-filter${pubFilter === t ? " active" : ""}`}
                  onClick={() => setPubFilter(t)}
                >
                  {t === "all" ? "All Publications" : t}
                </button>
              ))}
            </div>
            <ol className="pub-list">
              {filteredPubs.map((pub, i) => (
                <li key={i} className="pub-item">
                  <div className="pub-num">{String(i + 1).padStart(2, "0")}</div>
                  <div className="pub-body">
                    <span className="pub-type-badge">{pub.type}</span>
                    <h3 className="pub-title">{pub.title}</h3>
                    <p className="pub-desc">{pub.description}</p>
                    <div className="pub-foot">
                      <span className="pub-year">{pub.year}</span>
                      {pub.doi && (
                        <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noreferrer" className="pub-link">
                          DOI: {pub.doi}
                        </a>
                      )}
                      {pub.url && (
                        <a href={pub.url} target="_blank" rel="noreferrer" className="pub-link">
                          View Publication →
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* AWARDS — achievements.json: { title, description, image } */}
          <Carousel
            id="awards"
            title="Awards & Recognitions"
            items={awards}
            srcKey="image"
            titleKey="title"
            captionKey="description"
          />

          {/* CERTIFICATES — certificates.json: { src, title, issuer } */}
          <Carousel
            id="certificates"
            title="Certificates"
            items={certificates}
            srcKey="src"
            titleKey="title"
            captionKey="issuer"
          />

          {/* GALLERY — replace `certificates` with galleryData once gallery.json exists */}
          <Carousel
            id="gallery"
            title="Gallery"
            items={gallery}
            srcKey="src"
            titleKey="title"
            captionKey="issuer"
          />

          {/* FOOTER */}
          <footer className="rp-footer">
            <p>© {new Date().getFullYear()} Chandramouli Haldar &nbsp;·&nbsp; All rights reserved</p>
            <p className="footer-sub">
              Kolkata, India &nbsp;|&nbsp; chandramouli@novatech-is.in &nbsp;|&nbsp;
              <a href="https://orcid.org/0009-0004-9759-194X" target="_blank" rel="noreferrer">
                ORCID: 0009-0004-9759-194X
              </a>
            </p>
          </footer>

        </main>
      </div>
    </>
  );
}
