import React, { useState } from "react";

function Upload({ onNext, onBack, onHome, selectedChildId, children }) {
  const [name, setName] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [childId, setChildId] = useState(selectedChildId);
  const [activityType, setActivityType] = useState("custom");
  const [suggestedItems, setSuggestedItems] = useState([]);

  const applyTemplate = (type) => {
    setActivityType(type);
    if (type === "football") setName("Football Training");
    if (type === "picnic") setName("School Picnic");
    if (type === "swimming") setName("Swimming Class");
    if (type === "custom") setName("");
  };

  const suggestItems = (activityName) => {
    const value = activityName.toLowerCase();
    if (value.includes("football")) return ["Shoes", "Water Bottle"];
    if (value.includes("picnic")) return ["Snacks", "Mat", "Water Bottle"];
    if (value.includes("swimming")) return ["Swimwear", "Towel", "Water Bottle"];
    return ["Comfortable Clothes", "Water Bottle"];
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setScreenshotFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleNext = () => {
    if (!childId) {
      alert("Please add/select a child profile first from Dashboard.");
      return;
    }
    // Simulated screenshot extraction if user uploads an image.
    const simulatedName = "Football Training";
    const simulatedDateTime = new Date(Date.now() + 86400000)
      .toISOString()
      .slice(0, 16);

    if (!screenshotFile && (!name || !dateTime)) {
      alert("Upload a screenshot OR enter both activity name and date/time.");
      return;
    }

    onNext({
      source: screenshotFile ? "screenshot" : "manual",
      name: screenshotFile ? simulatedName : name,
      dateTime: screenshotFile ? simulatedDateTime : dateTime,
      screenshotName: screenshotFile ? screenshotFile.name : "",
      screenshotPreviewUrl: screenshotFile ? previewUrl : "",
      childId,
      childName: children.find((child) => child.id === childId)?.name || "Unknown child"
    });
  };

  return (
    <div>
      <p className="step-chip">Step 1 of 3 - Add Details</p>
      <h2 className="section-title">Add Activity</h2>
      <p className="section-subtitle">
        Add photo or type details. Keep it simple.
      </p>
      <label className="label" htmlFor="upload-child-select">
        Child Profile
      </label>
      {children.length > 0 ? (
        <select
          id="upload-child-select"
          className="input-field"
          value={childId}
          onChange={(e) => setChildId(e.target.value)}
        >
          {children.map((child) => (
            <option key={child.id} value={child.id}>
              {child.name}
            </option>
          ))}
        </select>
      ) : (
        <p className="meta-text">No child profiles found. Go Home and add a child first.</p>
      )}

      <label className="label">Upload Screenshot</label>
      <input type="file" accept="image/*" onChange={handleFileChange} className="input-field" />

      <label className="label" htmlFor="activity-template-select">
        Things to Carry Style
      </label>
      <select
        id="activity-template-select"
        className="input-field"
        value={activityType}
        onChange={(e) => applyTemplate(e.target.value)}
      >
        <option value="custom">Custom Activity</option>
        <option value="football">Football Template</option>
        <option value="picnic">Picnic Template</option>
        <option value="swimming">Swimming Template</option>
      </select>

      {previewUrl && (
        <div className="info-card">
          <img
            src={previewUrl}
            alt="Uploaded activity screenshot"
            className="preview-image"
          />
        </div>
      )}

      <p className="manual-divider"><strong>OR enter manually</strong></p>
      <label className="label">Activity Name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setSuggestedItems(suggestItems(e.target.value));
        }}
        placeholder="e.g. Football Training"
        className="input-field"
      />
      {name && (
        <div className="info-card">
          <p className="meta-text"><strong>💡 Things to Carry Suggestion:</strong></p>
          <p className="meta-text">{suggestedItems.join(", ")}</p>
        </div>
      )}

      <label className="label">Date and Time</label>
      <input
        type="datetime-local"
        value={dateTime}
        onChange={(e) => setDateTime(e.target.value)}
        className="input-field"
      />

      <div className="btn-row">
        <button onClick={handleNext} className="btn btn-primary">
          Next
        </button>
        <button onClick={onHome} className="btn btn-secondary">
          Home
        </button>
      </div>
      <details className="more-options">
        <summary>More options</summary>
        <div className="btn-row">
          <button onClick={onBack} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </details>
    </div>
  );
}

export default Upload;
