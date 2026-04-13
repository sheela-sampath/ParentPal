import React from "react";

function Calendar({
  activities,
  onAddActivity,
  onBack,
  onHome,
  selectedChildId,
  children,
  onChangeChild,
  onDeleteActivity,
  onToggleChecklistItem,
  onUpdateActivity
}) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [dateFilter, setDateFilter] = React.useState("all");

  const filteredActivities = activities.filter((activity) => activity.childId === selectedChildId);
  const now = new Date();
  const filteredByQueryAndDate = filteredActivities.filter((activity) => {
    const matchesSearch = activity.name.toLowerCase().includes(searchQuery.toLowerCase());
    const activityDate = new Date(activity.dateTime);
    if (dateFilter === "today") {
      const today = new Date();
      return (
        matchesSearch &&
        activityDate.getFullYear() === today.getFullYear() &&
        activityDate.getMonth() === today.getMonth() &&
        activityDate.getDate() === today.getDate()
      );
    }
    if (dateFilter === "upcoming") {
      return matchesSearch && activityDate >= now;
    }
    if (dateFilter === "past") {
      return matchesSearch && activityDate < now;
    }
    return matchesSearch;
  });

  const sortedActivities = [...filteredByQueryAndDate].sort(
    (a, b) => new Date(a.dateTime) - new Date(b.dateTime)
  );

  const handleEditActivity = (activity) => {
    const nextName = window.prompt("Edit activity name", activity.name);
    if (!nextName) return;
    const nextDateTime = window.prompt("Edit date/time (YYYY-MM-DDTHH:mm)", activity.dateTime);
    if (!nextDateTime) return;
    const nextChecklist = window.prompt(
      "Edit checklist (comma separated)",
      Array.isArray(activity.checklist) ? activity.checklist.join(", ") : ""
    );
    if (nextChecklist === null) return;
    const parsedChecklist = nextChecklist
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    onUpdateActivity(activity.id, {
      name: nextName.trim(),
      dateTime: nextDateTime.trim(),
      checklist: parsedChecklist.length > 0 ? parsedChecklist : activity.checklist
    });
  };

  return (
    <div>
      <p className="step-chip">Step 3 of 3 - Saved Activities</p>
      <h2 className="section-title">Calendar Screen</h2>
      <p className="section-subtitle">
        All saved activities with their weather-smart checklists.
      </p>
      <div className="tabs-row">
        {children.map((child) => (
          <button
            key={child.id}
            className={`tab-btn ${child.id === selectedChildId ? "active" : ""}`}
            onClick={() => onChangeChild(child.id)}
          >
            {child.name}
          </button>
        ))}
      </div>
      <div className="filters-grid">
        <input
          type="text"
          className="input-field"
          placeholder="Search activity name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="input-field"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <option value="all">All dates</option>
          <option value="today">Today</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </select>
      </div>

      {sortedActivities.length === 0 ? (
        <p>No matching activities for this child.</p>
      ) : (
        sortedActivities.map((activity) => (
          <div
            key={activity.id}
            className="activity-card"
          >
            <h3 className="section-title">{activity.name}</h3>
            <p className="meta-text">
              <strong>Child:</strong> {activity.childName}
            </p>
            <p className="meta-text">
              <strong>Date/Time:</strong> {new Date(activity.dateTime).toLocaleString()}
            </p>
            <p className="meta-text">
              <strong>Weather:</strong> {activity.weatherSummary}
            </p>

            {activity.screenshotPreviewUrl && (
              <img
                src={activity.screenshotPreviewUrl}
                alt="Activity screenshot"
                className="preview-image"
              />
            )}

            <p className="meta-text"><strong>Checklist:</strong></p>
            <ul className="checklist">
              {activity.checklist.map((item) => (
                <li key={item} className="checklist-item">
                  <label className="checklist-row">
                    <input
                      type="checkbox"
                      checked={Array.isArray(activity.checkedItems) && activity.checkedItems.includes(item)}
                      onChange={() => onToggleChecklistItem(activity.id, item)}
                    />
                    <span
                      className={
                        Array.isArray(activity.checkedItems) && activity.checkedItems.includes(item)
                          ? "checked-text"
                          : ""
                      }
                    >
                      {item}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <p className="meta-text">
              <strong>Progress:</strong>{" "}
              {(activity.checkedItems || []).length}/{activity.checklist.length} completed
            </p>
            <div className="btn-row">
              <button
                type="button"
                className="btn btn-secondary btn-small"
                onClick={() => handleEditActivity(activity)}
              >
                Edit Activity
              </button>
              <button
                type="button"
                className="btn btn-danger btn-small"
                onClick={() => onDeleteActivity(activity.id)}
              >
                Delete Activity
              </button>
            </div>
          </div>
        ))
      )}

      <div className="btn-row">
        <button onClick={onAddActivity} className="btn btn-primary">
          Add Another Activity
        </button>
        <button onClick={onBack} className="btn btn-secondary">
          Go to Dashboard
        </button>
        <button onClick={onHome} className="btn btn-secondary">
          Home
        </button>
      </div>
    </div>
  );
}

export default Calendar;
