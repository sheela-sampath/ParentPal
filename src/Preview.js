import React, { useCallback, useEffect, useMemo, useState } from "react";

const OUTDOOR_KEYWORDS = ["football", "soccer", "park", "outdoor", "cycling", "hiking", "training", "picnic"];

function Preview({ draftActivity, onConfirm, onBack, onHome, weatherCity }) {
  const [name, setName] = useState(draftActivity.name || "");
  const [dateTime, setDateTime] = useState(draftActivity.dateTime || "");
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState("");
  const [checklistText, setChecklistText] = useState("");
  const [hasChecklistEdit, setHasChecklistEdit] = useState(false);

  const fetchWeather = useCallback(async () => {
    try {
      setLoadingWeather(true);
      setWeatherError("");
      const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
      if (!apiKey) {
        throw new Error("API key missing. Add REACT_APP_WEATHER_API_KEY in .env");
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          weatherCity || "Bergen"
        )}&appid=${apiKey}&units=metric`
      );

      if (!response.ok) {
        if (response.status === 401) throw new Error("Invalid API key (401).");
        if (response.status === 429) throw new Error("Rate limit reached (429). Try again soon.");
        throw new Error(`Weather request failed (${response.status}).`);
      }

      const data = await response.json();
      setWeather({
        temperature: data.main.temp,
        condition: data.weather?.[0]?.main || "Unknown",
        description: data.weather?.[0]?.description || "No details"
      });
    } catch (error) {
      setWeatherError(error.message);
    } finally {
      setLoadingWeather(false);
    }
  }, [weatherCity]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  const checklist = useMemo(() => {
    const list = [];
    const lowerName = name.toLowerCase();
    const isOutdoor = OUTDOOR_KEYWORDS.some((keyword) => lowerName.includes(keyword));

    // Activity-specific baseline checklist.
    if (lowerName.includes("football")) {
      list.push("Shoes", "Water Bottle");
    } else if (lowerName.includes("picnic")) {
      list.push("Snacks", "Water Bottle", "Mat");
    } else if (lowerName.includes("swimming")) {
      list.push("Swimwear", "Towel", "Water Bottle");
    } else {
      list.push("Comfortable Clothes", "Water Bottle");
    }

    const weatherCondition = weather?.condition?.toLowerCase() || "";
    const isRainy = weatherCondition.includes("rain") || weatherCondition.includes("drizzle");
    const isCold = typeof weather?.temperature === "number" && weather.temperature < 10;

    // General weather rules from requirements.
    if (isRainy) {
      list.push("Raincoat");
    }
    if (isCold) {
      list.push("Jacket", "Gloves");
    }

    // Outdoor extras.
    if (isOutdoor) {
      if (isRainy) list.push("Umbrella");
      if (isCold) list.push("Hat");
    }

    return Array.from(new Set(list));
  }, [name, weather]);

  useEffect(() => {
    if (!hasChecklistEdit) {
      setChecklistText(checklist.join(", "));
    }
  }, [checklist, hasChecklistEdit]);

  const handleConfirm = () => {
    if (!name || !dateTime) {
      alert("Please provide both activity name and date/time.");
      return;
    }

    const finalChecklist = checklistText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const saved = {
      id: Date.now(),
      childId: draftActivity.childId,
      childName: draftActivity.childName,
      name,
      dateTime,
      checklist: finalChecklist.length > 0 ? finalChecklist : checklist,
      screenshotPreviewUrl: draftActivity.screenshotPreviewUrl || "",
      weatherSummary: weather
        ? `${weather.condition}, ${Math.round(weather.temperature)}°C`
        : weatherError || "Weather unavailable"
    };

    onConfirm(saved);
    // Simulated reminder message.
    alert("Reminder set: Activity confirmed and added to your calendar.");
  };

  return (
    <div>
      <p className="step-chip">Step 2 of 3 - Preview & Checklist</p>
      <h2 className="section-title">Preview Screen</h2>
      <p className="section-subtitle">
        Confirm activity details and generated checklist before saving.
      </p>
      <div className="info-card">
        <p className="meta-text">
          <strong>Child:</strong> {draftActivity.childName}
        </p>
      </div>

      {draftActivity.screenshotPreviewUrl && (
        <div className="info-card">
          <img
            src={draftActivity.screenshotPreviewUrl}
            alt="Activity screenshot preview"
            className="preview-image"
          />
          <p className="section-subtitle">
            Extracted from screenshot (simulated): {draftActivity.screenshotName}
          </p>
        </div>
      )}

      <label className="label">Activity Name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="input-field"
      />

      <label className="label">Date and Time</label>
      <input
        type="datetime-local"
        value={dateTime}
        onChange={(e) => setDateTime(e.target.value)}
        className="input-field"
      />

      <div className="info-card">
        <h3 className="section-title">Weather in {weatherCity || "Bergen"}</h3>
        {loadingWeather && <p>Loading weather...</p>}
        {!loadingWeather && weather && (
          <p>
            {weather.condition} ({weather.description}), {Math.round(weather.temperature)}°C
          </p>
        )}
        {!loadingWeather && weatherError && <p className="weather-error">{weatherError}</p>}
        {!loadingWeather && weatherError && (
          <button type="button" className="btn btn-secondary btn-small" onClick={fetchWeather}>
            Retry Weather
          </button>
        )}
      </div>

      <div className="info-card">
        <h3 className="section-title">Generated Checklist</h3>
        <ul className="checklist">
          {checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <label className="label" htmlFor="editable-checklist">
          Edit Checklist (comma separated)
        </label>
        <input
          id="editable-checklist"
          className="input-field"
          value={checklistText}
          onChange={(e) => {
            setChecklistText(e.target.value);
            setHasChecklistEdit(true);
          }}
        />
      </div>

      <div className="btn-row">
        <button onClick={handleConfirm} className="btn btn-primary">
          Save Activity
        </button>
        <button onClick={onBack} className="btn btn-secondary">
          Edit Details
        </button>
        <button onClick={onHome} className="btn btn-secondary">
          Home
        </button>
      </div>
    </div>
  );
}

export default Preview;
