// App.jsx
import React, { useState, useEffect } from "react";
import ResearchPortfolio from "./ResearchPortfolio";
import "./App.css";

function App() {
  const [theme] = useState("light"); // removed setTheme

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="App">
      <ResearchPortfolio />
    </div>
  );
}

export default App;
