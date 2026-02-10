// App.js
import React, { useState, useEffect } from "react";
import ResearchPortfolio from "./ResearchPortfolio";
import "./App.css";

function App() {
  const [theme, setTheme] = useState("light");

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Toggle function
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="App">

      {/* Dark Mode Toggle Button */}
     

      {/* Portfolio */}
      <ResearchPortfolio />

    </div>
  );
}

export default App;
