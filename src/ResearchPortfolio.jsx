// ResearchPortfolio.jsx
import React, { useState, useEffect } from "react";
import "./App.css";

// JSON imports
import publications from "./data/publications.json";
import experience from "./data/experience.json";
import education from "./data/education.json";
import researchInterests from "./data/researchInterests.json";
import achievements from "./data/achievements.json";
import certificates from "./data/certificates.json";

export default function ResearchPortfolio() {
  const [filter, setFilter] = useState("all");
  const [theme, setTheme] = useState("light");
  
// Function to translate text using Google's free translate API (no key)
const translateText = async (text, targetLang) => {
  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(
        text
      )}`
    );
    const data = await response.json();
    return data[0].map((item) => item[0]).join("");
  } catch (error) {
    console.error("Translation failed:", error);
    return text;
  }
};

// Function to translate all visible text on the page
const translatePage = async (targetLang) => {
  const elements = document.querySelectorAll("h1, h2, h3, p, li, button, a");
  for (const el of elements) {
    const original = el.innerText.trim();
    if (original) {
      const translated = await translateText(original, targetLang);
      el.innerText = translated;
    }
  }
};

  // Image modal states (existing + added)
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageList, setImageList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const filteredPublications =
    filter === "all"
      ? publications
      : publications.filter((p) => p.type === filter);

  return (
    <div className={`portfolio-container ${theme}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <img src="/img/dp.png" alt="Profile" className="profile-pic" />
        <h1 className="name">Chandramouli Haldar</h1>
        <p className="role">Student | Researcher | Innovator</p>
        <p className="tagline">Passionate about bridging hardware & software</p>
        <p className="location">📍 Kolkata, India</p>

        <div className="social-links">
          <a className="no-hover">
            <img src="https://img.icons8.com/?size=100&id=P7UIlhbpWzZm&format=png&color=000000" className="social-icon" />
            Chandramoulihaldar@gmail.com
          </a>
          <a className="no-hover">
            <img src="https://img.icons8.com/?size=100&id=35084&format=png&color=000000" className="social-icon" />
            chandramouli@novatech-is.in
          </a>
          <a href="https://www.linkedin.com/in/chandramouli01/" target="_blank" rel="noreferrer">
            <img src="https://img.icons8.com/?size=100&id=13930&format=png&color=000000" className="social-icon" />
            LinkedIn
          </a>
          <a href="https://github.com/Chandramouli001" target="_blank" rel="noreferrer">
            <img src="https://img.icons8.com/?size=100&id=63777&format=png&color=000000" className="social-icon" />
            GitHub
          </a>
          <a href="https://www.youtube.com/@Chandram0uli" target="_blank" rel="noreferrer">
            <img src="https://img.icons8.com/?size=100&id=19318&format=png&color=000000" className="social-icon" />
            YouTube
          </a>
          <a href="https://scholar.google.com/citations?user=VXo1zqUAAAAJ&hl=en&oi=ao" target="_blank" rel="noreferrer">
            <img src="https://img.icons8.com/?size=100&id=drPiDBy9kkJ3&format=png&color=000000" className="social-icon" />
            Google Scholar
          </a>
          <a href="https://orcid.org/0009-0004-9759-194X" target="_blank" rel="noreferrer">
            <img src="https://raw.githubusercontent.com/soulhydra101/img/refs/heads/main/orcididimage.png" className="social-icon" />
            ORCID
          </a>
          <a href="https://www.researchgate.net/profile/Chandramouli-Haldar-4" target="_blank" rel="noreferrer">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/ResearchGate_icon_SVG.svg" className="social-icon" />
            ResearchGate
          </a>
        </div>

          {/* Language Switch Flags */}
<div className="language-switch">
  <img
    src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg"
    alt="English"
    onClick={() => window.location.reload()}
  />
  <img
    src="https://upload.wikimedia.org/wikipedia/en/9/9e/Flag_of_Japan.svg"
    alt="Japanese"
    onClick={() => translatePage("ja")}
  />
</div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Bio */}
        <section className="bio-section">
          <div className="bio-header">
            <h2>Bio</h2>
            <button
              className="theme-toggle-btn"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? "🌙 Dark" : "☀️ Light"}
            </button>
          </div>

          <p className="bio-text">
            Chandramouli Haldar has an academic background in Computer Science and Engineering,
            along with a diploma in Electronics and Telecommunication Engineering.
          </p>
          <p className="bio-text">
            He has professional experience as a Junior Technical Faculty at Euphoria GenX,
            contributing to mentoring, project guidance, and hands-on MongoDB training.
          </p>
          <p className="bio-text">
            He gained international academic exposure through an innovation-focused internship
            at the Asian Institute of Technology (AIT), Bangkok, working with geospatial data,
            QGIS, and real-world datasets.
          </p>
          <p className="bio-text">
            He is also an active learner of the Japanese language and is inspired by Japan’s
            balance of tradition and advanced technology.
          </p>
        </section>

        {/* Experience */}
        <section>
          <h2>Experience</h2>
          <ul>
            {experience.map((exp, i) => (
              <li key={i}>
                <strong>{exp.role}</strong> – {exp.organization} ({exp.year})
              </li>
            ))}
          </ul>
        </section>

        {/* Education */}
        <section>
          <h2>Education</h2>
          <ul>
            {education.map((edu, i) => (
              <li key={i}>
                {edu.degree}, {edu.institution} – {edu.year}
              </li>
            ))}
          </ul>
        </section>

        {/* Research Interests */}
        <section>
          <h2>Research Interests</h2>
          <div className="grid">
            {researchInterests.map((interest, i) => (
              <div key={i} className="card">{interest}</div>
            ))}
          </div>
        </section>

        {/* Publications */}
        <section>
          <h2>Publications</h2>
          <div className="filters">
            {["all", "Conference Paper", "Journal Article", "Book", "Patent"].map((type) => (
              <button
                key={type}
                className={filter === type ? "active" : ""}
                onClick={() => setFilter(type)}
              >
                {type}
              </button>
            ))}
          </div>

          <ul>
            {filteredPublications.map((pub, i) => (
              <li key={i} className="card">
                <h3>{pub.title}</h3>
                <p><strong>{pub.type}</strong> | {pub.year}</p>
                {pub.doi && <p>DOI: <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noreferrer">{pub.doi}</a></p>}
                {pub.url && <p>URL: <a href={pub.url} target="_blank" rel="noreferrer">{pub.url}</a></p>}
                <p>{pub.description}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Achievements */}
        <section>
          <h2>Achievements</h2>
          <div className="achievements-carousel">
            <div className="achievements-track">
              {achievements.map((a, i) => (
                <div key={i} className="achievement-card">
                  <img
                    src={a.image}
                    alt={a.title}
                    className="zoomable"
                    onClick={() => {
                      setImageList(achievements.map(x => x.image));
                      setCurrentIndex(i);
                      setSelectedImage(a.image);
                    }}
                  />
                  <h3>{a.title}</h3>
                  <p>{a.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Certificates */}
        <section>
          <h2>Certificates</h2>
          <div className="certificates-carousel">
            <div className="certificates-track">
              {certificates.map((img, i) => (
                <div key={i} className="certificate-card">
                  <img
                    src={img}
                    alt={`Certificate ${i + 1}`}
                    className="zoomable"
                    onClick={() => {
                      setImageList(certificates);
                      setCurrentIndex(i);
                      setSelectedImage(img);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Image Modal with Swipe */}
        {selectedImage && (
          <div
            className="image-modal"
            onClick={() => setSelectedImage(null)}
            onTouchStart={(e) => (window._touchX = e.changedTouches[0].screenX)}
            onTouchEnd={(e) => {
              const diff = window._touchX - e.changedTouches[0].screenX;
              if (diff > 50 && currentIndex < imageList.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setSelectedImage(imageList[currentIndex + 1]);
              }
              if (diff < -50 && currentIndex > 0) {
                setCurrentIndex(currentIndex - 1);
                setSelectedImage(imageList[currentIndex - 1]);
              }
            }}
          >
            {currentIndex > 0 && (
              <button
                className="nav-btn left"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(currentIndex - 1);
                  setSelectedImage(imageList[currentIndex - 1]);
                }}
              >
                ‹
              </button>
            )}

            <img src={selectedImage} alt="Enlarged view" />

            {currentIndex < imageList.length - 1 && (
              <button
                className="nav-btn right"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(currentIndex + 1);
                  setSelectedImage(imageList[currentIndex + 1]);
                }}
              >
                ›
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
