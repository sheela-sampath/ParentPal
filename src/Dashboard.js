import React from "react";

function Dashboard({
  upcomingActivity,
  activities,
  onAddActivity,
  onViewCalendar,
  weatherCity,
  selectedChildId,
  children,
  onChangeChild,
  onAddChild,
  onRenameChild
}) {
  const selectedChildName =
    children.find((child) => child.id === selectedChildId)?.name || "Selected child";
  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const totalActivities = activities.length;
  const completedItems = activities.reduce(
    (sum, activity) => sum + (Array.isArray(activity.checkedItems) ? activity.checkedItems.length : 0),
    0
  );
  const upcomingThisWeek = activities.filter((activity) => {
    const activityDate = new Date(activity.dateTime);
    return activityDate >= now && activityDate <= oneWeekFromNow;
  }).length;

  const handleAddChildClick = () => {
    const nextName = window.prompt("Enter new child name");
    if (!nextName) return;
    const added = onAddChild(nextName);
    if (!added) {
      alert("Child name cannot be empty.");
    }
  };

  const handleRenameChildClick = () => {
    const currentName = children.find((child) => child.id === selectedChildId)?.name || "";
    const nextName = window.prompt("Edit child name", currentName);
    if (!nextName) return;
    onRenameChild(selectedChildId, nextName);
  };

  return (
    <div>
      <h2 className="section-title">Home</h2>
      <p className="section-subtitle">Start here. Add child, then add activity.</p>
      <div className="filter-row">
        <label className="label" htmlFor="dashboard-child-select">
          Viewing child
        </label>
        {children.length > 0 ? (
          <select
            id="dashboard-child-select"
            className="input-field"
            value={selectedChildId}
            onChange={(e) => onChangeChild(e.target.value)}
          >
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name}
              </option>
            ))}
          </select>
        ) : (
          <p className="meta-text">No child profile yet. Add a child to start planning activities.</p>
        )}
        <div className="btn-row">
          <button type="button" className="btn btn-secondary btn-small" onClick={handleAddChildClick}>
            Add Child
          </button>
          <button type="button" className="btn btn-secondary btn-small" onClick={handleRenameChildClick}>
            Edit Name
          </button>
        </div>
      </div>

      <div className="activity-card">
        <h3 className="section-title">Upcoming Activity for {selectedChildName}</h3>
        <p className="meta-text">
          <strong>Weather City:</strong> {weatherCity}
        </p>
        {upcomingActivity ? (
          <div>
            <p className="meta-text">
              <strong>Child:</strong> {upcomingActivity.childName}
            </p>
            <p className="meta-text">
              <strong>Name:</strong> {upcomingActivity.name}
            </p>
            <p className="meta-text">
              <strong>Date/Time:</strong>{" "}
              {new Date(upcomingActivity.dateTime).toLocaleString()}
            </p>
            <p className="meta-text">
              <strong>Weather:</strong> {upcomingActivity.weatherSummary}
            </p>
          </div>
        ) : (
          <p className="meta-text">No upcoming activities yet.</p>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Total Activities</p>
          <p className="stat-value">{totalActivities}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Checklist Done</p>
          <p className="stat-value">{completedItems}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Upcoming This Week</p>
          <p className="stat-value">{upcomingThisWeek}</p>
        </div>
      </div>

      <div className="btn-row">
        <button onClick={onAddActivity} className="btn btn-primary" disabled={!selectedChildId}>
          Next
        </button>
      </div>
      <details className="more-options">
        <summary>More options</summary>
        <div className="btn-row">
          <button onClick={onViewCalendar} className="btn btn-secondary">
            Done List
          </button>
        </div>
      </details>
    </div>
  );
}

export default Dashboard;
