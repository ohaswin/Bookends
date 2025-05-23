import React, { useState, useEffect } from "react";
import Sidepanel from "../Sidepanel";
import { useTheme, Theme } from "../../ThemeContext";
import {open} from "@tauri-apps/plugin-dialog";
import {FolderIcon} from "@heroicons/react/24/outline";
const Settings = () => {
  const { lightTheme, darkTheme, updateTheme, themeMode } = useTheme();
  const [activeTab, setActiveTab] = useState<"general" | "appearance" | "privacy" | "misc">("appearance");
  const [localLightTheme, setLocalLightTheme] = useState<Theme>(lightTheme);
  const [localDarkTheme, setLocalDarkTheme] = useState<Theme>(darkTheme);
  const [history, setHistory] = useState<{ light: Theme; dark: Theme }[]>([
    { light: lightTheme, dark: darkTheme },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [lightWallpaperImage, setLightWallpaperImage] = useState(lightTheme.wallpaperImage || "");
  const [darkWallpaperImage, setDarkWallpaperImage] = useState(darkTheme.wallpaperImage || "");
  const [isLightWallpaperEnabled, setIsLightWallpaperEnabled] = useState(lightTheme.isWallpaperEnabled || false);
  const [isDarkWallpaperEnabled, setIsDarkWallpaperEnabled] = useState(darkTheme.isWallpaperEnabled || false);

  // Sync local themes with the global themes
  useEffect(() => {
    setLocalLightTheme(lightTheme);
    setLocalDarkTheme(darkTheme);
    setHistory([{ light: lightTheme, dark: darkTheme }]);
    setHistoryIndex(0);
  }, [lightTheme, darkTheme]);

  // Handle color changes
  const handleColorChange = (key: keyof Theme, color: string, mode: "light" | "dark") => {
    if (mode === "light") {
      const updatedLightTheme = { ...localLightTheme, [key]: color };
      setLocalLightTheme(updatedLightTheme);
      updateTheme(updatedLightTheme, undefined); // Update only the light theme
      addToHistory(updatedLightTheme, localDarkTheme);
    } else {
      const updatedDarkTheme = { ...localDarkTheme, [key]: color };
      setLocalDarkTheme(updatedDarkTheme);
      updateTheme(undefined, updatedDarkTheme); // Update only the dark theme
      addToHistory(localLightTheme, updatedDarkTheme);
    }
  };

  const handleWallpaperChange = (key: "wallpaperImage" | "isWallpaperEnabled", value: string | boolean, mode: "light" | "dark") => {
  if (mode === "light") {
    const updatedLightTheme = { ...localLightTheme, [key]: value };
    setLocalLightTheme(updatedLightTheme);
    updateTheme(updatedLightTheme, undefined);
    addToHistory(updatedLightTheme, localDarkTheme);
    if (key === "wallpaperImage") setLightWallpaperImage(value as string);
    if (key === "isWallpaperEnabled") setIsLightWallpaperEnabled(value as boolean);
  } else {
    const updatedDarkTheme = { ...localDarkTheme, [key]: value };
    setLocalDarkTheme(updatedDarkTheme);
    updateTheme(undefined, updatedDarkTheme);
    addToHistory(localLightTheme, updatedDarkTheme);
    if (key === "wallpaperImage") setDarkWallpaperImage(value as string);
    if (key === "isWallpaperEnabled") setIsDarkWallpaperEnabled(value as boolean);
  }
};

  // Undo functionality
  const undo = () => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setLocalLightTheme(previousState.light);
      setLocalDarkTheme(previousState.dark);
      updateTheme(previousState.light, previousState.dark);
      setHistoryIndex(historyIndex - 1);
    }
  };

  // Redo functionality
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setLocalLightTheme(nextState.light);
      setLocalDarkTheme(nextState.dark);
      updateTheme(nextState.light, nextState.dark);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Add to history
  const addToHistory = (lightTheme: Theme, darkTheme: Theme) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push({ light: lightTheme, dark: darkTheme });
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
  };

  // Export theme as JSON
  const exportTheme = () => {
    const themeJSON = JSON.stringify({ light: localLightTheme, dark: localDarkTheme }, null, 2);
    const blob = new Blob([themeJSON], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "theme.json";
    link.target = "_blank";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import theme from JSON
  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedThemes = JSON.parse(e.target?.result as string);
          setLocalLightTheme(importedThemes.light);
          setLocalDarkTheme(importedThemes.dark);
          updateTheme(importedThemes.light, importedThemes.dark);
          addToHistory(importedThemes.light, importedThemes.dark);
        } catch (error) {
          console.error("Invalid theme file");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      <Sidepanel/>
      <div className={`pt-[30px] min-h-screen bg-transparent backdrop-blur-md flex flex-col items-center ${themeMode=="light" ? "text-bookends-text" : "text-bookends-dark-text"}`}>
        <div className="w-full max-w-4xl px-6 py-12">
          {/* Tabs */}
          <div className="glass-blur bg-gradient-to-br from-white/30 to-white/10 dark:from-black/30 dark:to-black/10 backdrop-blur-md border border-white/20 dark:border-black/20 rounded-xl shadow-lg p-4 mb-8">
            <div className="flex flex-wrap justify-center gap-4">
              {["general", "appearance", "privacy", "miscellaneous"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                    activeTab === tab
                      ?  themeMode === "light" ? "bg-bookends-accent text-black" :"bg-bookends-dark-accent text-black"
                      : "bg-transparent text-white hover:bg-white/20 dark:hover:bg-black/20"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="glass-blur bg-gradient-to-br from-white/30 to-white/10 dark:from-black/30 dark:to-black/10 backdrop-blur-md border border-white/20 dark:border-black/20 rounded-xl shadow-lg p-6">
            {activeTab === "appearance" && (
              <div>
                <h2 className={`text-2xl font-bold rounded-full mb-4 text-center`}>Appearance Settings</h2>
                <div className="space-y-6">
                  {/* Light Theme Settings */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Light Theme</h3>
                    <div className="space-y-4">
                      {/* Primary Color */}
                      <div className="flex items-center justify-between">
                        <span>Primary Color</span>
                        <input
                          type="color"
                          value={localLightTheme.primary}
                          onChange={(e) => handleColorChange("primary", e.target.value, "light")}
                          className="w-10 h-10 border-none cursor-pointer"
                        />
                      </div>
                      {/* Secondary Color */}
                      <div className="flex items-center justify-between">
                        <span>Secondary Color</span>
                        <input
                          type="color"
                          value={localLightTheme.secondary}
                          onChange={(e) => handleColorChange("secondary", e.target.value, "light")}
                          className="w-10 h-10 border-none cursor-pointer"
                        />
                      </div>
                      {/* Accent Color */}
                      <div className="flex items-center justify-between">
                        <span>Accent Color</span>
                        <input
                          type="color"
                          value={localLightTheme.accent}
                          onChange={(e) => handleColorChange("accent", e.target.value, "light")}
                          className="w-10 h-10 border-none cursor-pointer"
                        />
                      </div>
                      {/* Text Color */}
                      <div className="flex items-center justify-between">
                        <span>Text Color</span>
                        <input
                          type="color"
                          value={localLightTheme.textColor}
                          onChange={(e) => handleColorChange("textColor", e.target.value, "light")}
                          className="w-10 h-10 border-none cursor-pointer"
                        />
                      </div>
                      {/* Font Title */}
                      <div className="flex items-center justify-between">
                        <span>Font Title</span>
                        <input
                          type="text"
                          value={localLightTheme.fontTitle}
                          onChange={(e) => handleColorChange("fontTitle", e.target.value, "light")}
                          className="w-fit px-2 py-1 border rounded"
                        />
                      </div>
                      {/* Font Body */}
                      <div className="flex items-center justify-between">
                        <span>Font Body</span>
                        <input
                          type="text"
                          value={localLightTheme.fontBody}
                          onChange={(e) => handleColorChange("fontBody", e.target.value, "light")}
                          className="w-fit px-2 py-1 border rounded"
                        />
                      </div>
                      {/* Light Theme Wallpaper */}
<div>
  <h3 className="text-lg font-semibold mb-2">Wallpaper (Light Theme)</h3>
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={lightWallpaperImage}
        onChange={(e) => handleWallpaperChange("wallpaperImage", e.target.value, "light")}
        className={`w-full rounded-md bg-transparent border border-white/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/20 ${themeMode == "light" ? "text-bookends-text" : "text-bookends-dark-text"}`}
      />
      <button
        onClick={async () => {
          const filePath = await open({
            multiple: false,
            directory: false,
            filters: [{ name: "Images", extensions: ["jpg", "jpeg", "png", "gif"] }],
          });
          if (filePath) handleWallpaperChange("wallpaperImage", filePath as string, "light");
        }}
        className={`p-2 rounded-md ${themeMode == "light" ? "bg-bookends-accent hover:bg-bookends-accent/70":"bg-bookends-dark-accent hover:bg-bookends-dark-accent/70"}`}
      >
        <FolderIcon className="h-5 w-5" />
      </button>
    </div>
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={isLightWallpaperEnabled}
        onChange={(e) => handleWallpaperChange("isWallpaperEnabled", e.target.checked, "light")}
        className="h-4 w-4"
      />
      <label className={`${themeMode == "light" ? "text-bookends-text" : "text-bookends-dark-text"} text-sm`}>Enable Wallpaper</label>
    </div>
  </div>
</div>

                    </div>
                  </div>

                  <hr className="my-6 border-gray-300 dark:border-gray-600" />

                  {/* Dark Theme Settings */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Dark Theme</h3>
                    <div className="space-y-4">
                      {/* Primary Color */}
                      <div className="flex items-center justify-between">
                        <span>Primary Color</span>
                        <input
                          type="color"
                          value={localDarkTheme.primary}
                          onChange={(e) => handleColorChange("primary", e.target.value, "dark")}
                          className="w-10 h-10 border-none cursor-pointer"
                        />
                      </div>
                      {/* Secondary Color */}
                      <div className="flex items-center justify-between">
                        <span>Secondary Color</span>
                        <input
                          type="color"
                          value={localDarkTheme.secondary}
                          onChange={(e) => handleColorChange("secondary", e.target.value, "dark")}
                          className="w-10 h-10 border-none cursor-pointer"
                        />
                      </div>
                      {/* Accent Color */}
                      <div className="flex items-center justify-between">
                        <span>Accent Color</span>
                        <input
                          type="color"
                          value={localDarkTheme.accent}
                          onChange={(e) => handleColorChange("accent", e.target.value, "dark")}
                          className="w-10 h-10 border-none cursor-pointer"
                        />
                      </div>
                      {/* Text Color */}
                      <div className="flex items-center justify-between">
                        <span>Text Color</span>
                        <input
                          type="color"
                          value={localDarkTheme.textColor}
                          onChange={(e) => handleColorChange("textColor", e.target.value, "dark")}
                          className="w-10 h-10 border-none cursor-pointer"
                        />
                      </div>
                      {/* Font Title */}
                      <div className="flex items-center justify-between">
                        <span>Title Font</span>
                        <input
                          type="text"
                          value={localDarkTheme.fontTitle}
                          onChange={(e) => handleColorChange("fontTitle", e.target.value, "dark")}
                          className="w-fit px-2 py-1 border rounded"
                        />
                      </div>
                      {/* Font Body */}
                      <div className="flex items-center justify-between">
                        <span>Body Font</span>
                        <input
                          type="text"
                          value={localDarkTheme.fontBody}
                          onChange={(e) => handleColorChange("fontBody", e.target.value, "dark")}
                          className="w-fit px-2 py-1 border rounded"
                        />
                      </div>
                      {/* Light Theme Wallpaper */}

{/* Dark Theme Wallpaper */}
<div>
  <h3 className="text-lg font-semibold mb-2">Wallpaper (Dark Theme)</h3>
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={darkWallpaperImage}
        onChange={(e) => handleWallpaperChange("wallpaperImage", e.target.value, "dark")}
        className={`w-full rounded-md bg-transparent border border-white/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/20 ${themeMode == "light" ? "text-bookends-text" : "text-bookends-dark-text"}`}
      />
      <button
        onClick={async () => {
          const filePath = await open({
            multiple: false,
            directory: false,
            filters: [{ name: "Images", extensions: ["jpg", "jpeg", "png", "gif"] }],
          });
          if (filePath) handleWallpaperChange("wallpaperImage", filePath as string, "dark");
        }}
        className={`p-2 rounded-md ${themeMode == "light" ? "bg-bookends-accent hover:bg-bookends-accent/70":"bg-bookends-dark-accent hover:bg-bookends-dark-accent/70"}`}
      >
        <FolderIcon className="h-5 w-5" />
      </button>
    </div>
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={isDarkWallpaperEnabled}
        onChange={(e) => handleWallpaperChange("isWallpaperEnabled", e.target.checked, "dark")}
        className="h-4 w-4"
      />
      <label className="text-sm text-white">Enable Wallpaper</label>
    </div>
  </div>
</div>
                    </div>
                  </div>

                  {/* Export/Import Buttons */}
                  <div className="flex items-center justify-between mt-6">
                    <button
                      onClick={exportTheme}
                      className={`px-4 py-2 ${themeMode === "light" ? "bg-bookends-accent" : "bg-bookends-dark-accent"} text-black rounded-lg shadow-md hover:bg-bookends-accent/80`}
                    >
                      Export Theme
                    </button>
                    <label className={`px-4 py-2 ${themeMode === "light" ? "bg-bookends-accent" : "bg-bookends-dark-accent" } text-black rounded-lg shadow-md hover:bg-bookends-accent/80 cursor-pointer`}>
                      Import Theme
                      <input
                        type="file"
                        accept="application/json"
                        onChange={importTheme}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Undo/Redo Buttons */}
                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={undo}
                      disabled={historyIndex === 0}
                      className={`px-4 py-2 rounded-lg shadow-md ${
                        historyIndex === 0
                          ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                          : "bg-bookends-accent text-black hover:bg-bookends-accent/80"
                      }`}
                    >
                      Undo
                    </button>
                    <button
                      onClick={redo}
                      disabled={historyIndex === history.length - 1}
                      className={`px-4 py-2 rounded-lg shadow-md ${
                        historyIndex === history.length - 1
                          ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                          : "bg-bookends-accent text-black hover:bg-bookends-accent/80"
                      }`}
                    >
                      Redo
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Other Tabs */}
            {activeTab === "general" && <div>General Settings Content</div>}
            {activeTab === "privacy" && <div>Privacy Settings Content</div>}
            {activeTab === "misc" && <div>Miscellaneous Settings Content</div>}
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;