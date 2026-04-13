import React, { useEffect, useMemo, useState } from "react";
import Dashboard from "./Dashboard";
import Upload from "./Upload";
import Preview from "./Preview";
import Calendar from "./Calendar";

const ACTIVITIES_STORAGE_KEY = "parentpal_activities";
const CHILDREN_STORAGE_KEY = "parentpal_children";
const PARENT_NAME_STORAGE_KEY = "parentpal_parent_name";
const WEATHER_CITY_STORAGE_KEY = "parentpal_weather_city";

function App() {
  const [authScreen, setAuthScreen] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [parentName, setParentName] = useState("");
  const [parentNameInput, setParentNameInput] = useState("");
  const [weatherCityInput, setWeatherCityInput] = useState("Bergen");
  const [weatherCity, setWeatherCity] = useState("Bergen");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [screen, setScreen] = useState("dashboard");
  const [activities, setActivities] = useState([]);
  const [draftActivity, setDraftActivity] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState("");

  useEffect(() => {
    try {
      const savedChildren = localStorage.getItem(CHILDREN_STORAGE_KEY);
      if (savedChildren) {
        const parsedChildren = JSON.parse(savedChildren);
        if (Array.isArray(parsedChildren) && parsedChildren.length > 0) {
          setChildren(parsedChildren);
          setSelectedChildId(parsedChildren[0].id);
        }
      }

      const savedActivities = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
      if (!savedActivities) return;
      const parsed = JSON.parse(savedActivities);
      if (Array.isArray(parsed)) {
        // Backward compatibility for activities saved before multi-child support.
        const parsedSavedChildren = savedChildren ? JSON.parse(savedChildren) : [];
        const fallbackChild = parsedSavedChildren[0] || { id: "child-missing", name: "No child selected" };
        const normalized = parsed.map((activity) => ({
          ...activity,
          childId: activity.childId || fallbackChild.id,
          childName: activity.childName || fallbackChild.name,
          checkedItems: Array.isArray(activity.checkedItems) ? activity.checkedItems : []
        }));
        setActivities(normalized);
      }

      const savedParentName = localStorage.getItem(PARENT_NAME_STORAGE_KEY);
      if (savedParentName) {
        setParentName(savedParentName);
        setParentNameInput(savedParentName);
        setIsLoggedIn(true);
      }

      const savedWeatherCity = localStorage.getItem(WEATHER_CITY_STORAGE_KEY);
      if (savedWeatherCity) {
        setWeatherCity(savedWeatherCity);
        setWeatherCityInput(savedWeatherCity);
      }
    } catch (error) {
      console.error("Could not read saved app data:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities));
    } catch (error) {
      console.error("Could not save activities:", error);
    }
  }, [activities]);

  useEffect(() => {
    try {
      localStorage.setItem(CHILDREN_STORAGE_KEY, JSON.stringify(children));
    } catch (error) {
      console.error("Could not save children:", error);
    }
  }, [children]);

  useEffect(() => {
    try {
      if (parentName) {
        localStorage.setItem(PARENT_NAME_STORAGE_KEY, parentName);
      }
    } catch (error) {
      console.error("Could not save parent name:", error);
    }
  }, [parentName]);

  useEffect(() => {
    try {
      if (weatherCity) {
        localStorage.setItem(WEATHER_CITY_STORAGE_KEY, weatherCity);
      }
    } catch (error) {
      console.error("Could not save weather city:", error);
    }
  }, [weatherCity]);

  useEffect(() => {
    if (!children.some((child) => child.id === selectedChildId)) {
      setSelectedChildId(children[0]?.id || "");
    }
  }, [children, selectedChildId]);

  const upcomingActivity = useMemo(() => {
    const now = new Date();
    return [...activities]
      .filter((activity) => activity.childId === selectedChildId)
      .filter((activity) => new Date(activity.dateTime) >= now)
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))[0];
  }, [activities, selectedChildId]);

  const openUploadScreen = () => setScreen("upload");
  const openCalendarScreen = () => setScreen("calendar");

  const handlePreviewRequest = (payload) => {
    setDraftActivity(payload);
    setScreen("preview");
  };

  const handleConfirmActivity = (confirmedActivity) => {
    setActivities((prev) => [...prev, { ...confirmedActivity, checkedItems: [] }]);
    setDraftActivity(null);
    setScreen("calendar");
  };

  const handleDeleteActivity = (activityId) => {
    setActivities((prev) => prev.filter((activity) => activity.id !== activityId));
  };

  const handleUpdateActivity = (activityId, updates) => {
    setActivities((prev) =>
      prev.map((activity) => {
        if (activity.id !== activityId) return activity;
        const nextActivity = { ...activity, ...updates };
        if (Array.isArray(nextActivity.checklist) && Array.isArray(nextActivity.checkedItems)) {
          nextActivity.checkedItems = nextActivity.checkedItems.filter((item) =>
            nextActivity.checklist.includes(item)
          );
        }
        return nextActivity;
      })
    );
  };

  const handleAddChild = (name) => {
    const trimmedName = name.trim();
    if (!trimmedName) return false;
    const newChild = {
      id: `kid-${Date.now()}`,
      name: trimmedName
    };
    setChildren((prev) => [...prev, newChild]);
    setSelectedChildId(newChild.id);
    return true;
  };

  const handleRenameChild = (childId, nextName) => {
    const trimmedName = nextName.trim();
    if (!trimmedName) return;
    setChildren((prev) =>
      prev.map((child) => (child.id === childId ? { ...child, name: trimmedName } : child))
    );
    setActivities((prev) =>
      prev.map((activity) =>
        activity.childId === childId ? { ...activity, childName: trimmedName } : activity
      )
    );
  };

  const handleBackToDashboard = () => {
    setDraftActivity(null);
    setScreen("dashboard");
  };

  const handleToggleChecklistItem = (activityId, item) => {
    setActivities((prev) =>
      prev.map((activity) => {
        if (activity.id !== activityId) return activity;
        const checkedItems = Array.isArray(activity.checkedItems) ? activity.checkedItems : [];
        const nextChecked = checkedItems.includes(item)
          ? checkedItems.filter((checkedItem) => checkedItem !== item)
          : [...checkedItems, item];
        return { ...activity, checkedItems: nextChecked };
      })
    );
  };

  const handleLogin = () => {
    const trimmedName = parentNameInput.trim();
    if (!trimmedName || !authEmail.trim() || !authPassword.trim()) {
      alert("Please enter name, email, and password to continue.");
      return;
    }
    setParentName(trimmedName);
    setWeatherCity(weatherCityInput.trim() || "Bergen");
    setIsLoggedIn(true);
    setScreen("dashboard");
  };

  const handleSignup = () => {
    const trimmedName = parentNameInput.trim();
    if (!trimmedName || !authEmail.trim() || !authPassword.trim()) {
      alert("Please complete all fields to sign up.");
      return;
    }
    setParentName(trimmedName);
    setWeatherCity(weatherCityInput.trim() || "Bergen");
    setIsLoggedIn(true);
    setScreen("dashboard");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthScreen("home");
  };

  if (!isLoggedIn) {
    const isHome = authScreen === "home";
    const isSignup = authScreen === "signup";

    return (
      <div className="app-shell">
        <div className="page-card login-card">
          {isHome && (
            <>
              <div className="auth-home-top">
                <h2 className="welcome-title">Welcome to</h2>
                <h1 className="app-title auth-brand">ParentPal</h1>
                <div className="family-illustration" aria-hidden="true">
                  <span role="img" aria-label="family">
                    👨‍👩‍👧
                  </span>
                </div>
              </div>

              <div className="auth-panel">
                <h2 className="auth-panel-title">Let&apos;s get started</h2>
                <p className="auth-panel-subtitle">Track activities, checklists, and weather in one place.</p>
                <div className="btn-row">
                  <button type="button" className="btn btn-primary auth-btn" onClick={() => setAuthScreen("signup")}>
                    Sign Up
                  </button>
                  <button type="button" className="btn btn-secondary auth-btn" onClick={() => setAuthScreen("login")}>
                    Login
                  </button>
                </div>
              </div>
            </>
          )}

          {!isHome && (
            <>
              <div className="auth-home-top compact">
                <h1 className="app-title auth-brand">ParentPal</h1>
                <p className="app-subtitle">
                  {isSignup ? "Create your ParentPal account" : "Welcome back. Login to continue"}
                </p>
              </div>

              <div className="auth-panel">
                <h2 className="auth-panel-title">{isSignup ? "Sign Up" : "Login"}</h2>
                <label className="label" htmlFor="parent-name">
                  Name
                </label>
                <input
                  id="parent-name"
                  className="input-field"
                  placeholder="Olivia Wilson"
                  value={parentNameInput}
                  onChange={(e) => setParentNameInput(e.target.value)}
                />

                <label className="label" htmlFor="parent-email">
                  Email
                </label>
                <input
                  id="parent-email"
                  type="email"
                  className="input-field"
                  placeholder="hello@reallygreatsite.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                />

                <label className="label" htmlFor="parent-password">
                  Password
                </label>
                <input
                  id="parent-password"
                  type="password"
                  className="input-field"
                  placeholder="******"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                />

                <label className="label" htmlFor="weather-city">
                  Weather City
                </label>
                <input
                  id="weather-city"
                  className="input-field"
                  placeholder="e.g. Oslo"
                  value={weatherCityInput}
                  onChange={(e) => setWeatherCityInput(e.target.value)}
                />

                <button
                  type="button"
                  className="btn btn-primary auth-btn"
                  onClick={isSignup ? handleSignup : handleLogin}
                >
                  {isSignup ? "Create Account" : "Next"}
                </button>

                <p className="auth-switch-text">
                  {isSignup ? "Already have an account?" : "New to ParentPal?"}{" "}
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => setAuthScreen(isSignup ? "login" : "signup")}
                  >
                    {isSignup ? "Sign in" : "Sign up"}
                  </button>
                </p>

                <button type="button" className="link-btn back-link" onClick={() => setAuthScreen("home")}>
                  Back to Home
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="page-card">
        <h1 className="app-title">ParentPal</h1>
        <p className="app-subtitle">
          Welcome {parentName}. Plan smarter and never miss an activity.
        </p>
        <div className="top-actions">
          <button type="button" className="btn btn-secondary btn-small" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {screen === "dashboard" && (
          <Dashboard
            upcomingActivity={upcomingActivity}
            activities={activities}
            selectedChildId={selectedChildId}
            children={children}
            onChangeChild={setSelectedChildId}
            onAddActivity={openUploadScreen}
            onViewCalendar={openCalendarScreen}
            onAddChild={handleAddChild}
            onRenameChild={handleRenameChild}
            weatherCity={weatherCity}
          />
        )}

        {screen === "upload" && (
          <Upload
            onNext={handlePreviewRequest}
            onBack={handleBackToDashboard}
            onHome={handleBackToDashboard}
            selectedChildId={selectedChildId}
            children={children}
          />
        )}

        {screen === "preview" && draftActivity && (
          <Preview
            draftActivity={draftActivity}
            onConfirm={handleConfirmActivity}
            onBack={() => setScreen("upload")}
            onHome={handleBackToDashboard}
            weatherCity={weatherCity}
          />
        )}

        {screen === "calendar" && (
          <Calendar
            activities={activities}
            onAddActivity={openUploadScreen}
            onBack={handleBackToDashboard}
            onHome={handleBackToDashboard}
            selectedChildId={selectedChildId}
            children={children}
            onChangeChild={setSelectedChildId}
            onDeleteActivity={handleDeleteActivity}
            onToggleChecklistItem={handleToggleChecklistItem}
            onUpdateActivity={handleUpdateActivity}
          />
        )}
      </div>
    </div>
  );
}

export default App;
