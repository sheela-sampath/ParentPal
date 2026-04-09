import React, { useEffect, useMemo, useState } from "react";
import Dashboard from "./Dashboard";
import Upload from "./Upload";
import Preview from "./Preview";
import Calendar from "./Calendar";
import SharePage from "./SharePage";

const ACTIVITIES_STORAGE_KEY = "parentpal_activities";
const CHILDREN_STORAGE_KEY = "parentpal_children";
const PARENT_NAME_STORAGE_KEY = "parentpal_parent_name";
const DEFAULT_CHILDREN = [
  { id: "kid-1", name: "Viyan" },
  { id: "kid-2", name: "Tara" }
];

function App() {
  const [authScreen, setAuthScreen] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [parentName, setParentName] = useState("");
  const [parentNameInput, setParentNameInput] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [screen, setScreen] = useState("dashboard");
  const [activities, setActivities] = useState([]);
  const [draftActivity, setDraftActivity] = useState(null);
  const [children, setChildren] = useState(DEFAULT_CHILDREN);
  const [selectedChildId, setSelectedChildId] = useState(DEFAULT_CHILDREN[0].id);

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
        const fallbackChild = (savedChildren && JSON.parse(savedChildren)?.[0]) || DEFAULT_CHILDREN[0];
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
    setIsLoggedIn(true);
    setScreen("upload");
  };

  const handleSignup = () => {
    const trimmedName = parentNameInput.trim();
    if (!trimmedName || !authEmail.trim() || !authPassword.trim()) {
      alert("Please complete all fields to sign up.");
      return;
    }
    setParentName(trimmedName);
    setIsLoggedIn(true);
    setScreen("upload");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthScreen("home");
  };

  const handleGoToSharePage = () => setScreen("share");

  const handleLoadDemoActivities = () => {
    const now = Date.now();
    const childA = children[0] || { id: "kid-1", name: "Viyan" };
    const childB = children[1] || childA;
    const demoActivities = [
      {
        id: now + 1,
        childId: childA.id,
        childName: childA.name,
        name: "Football Training",
        dateTime: new Date(now + 1000 * 60 * 60 * 24).toISOString().slice(0, 16),
        checklist: ["Shoes", "Water Bottle", "Jacket"],
        checkedItems: ["Shoes"],
        screenshotPreviewUrl: "",
        weatherSummary: "Clouds, 8°C"
      },
      {
        id: now + 2,
        childId: childB.id,
        childName: childB.name,
        name: "School Picnic",
        dateTime: new Date(now + 1000 * 60 * 60 * 48).toISOString().slice(0, 16),
        checklist: ["Comfortable Clothes", "Water Bottle", "Raincoat", "Umbrella"],
        checkedItems: [],
        screenshotPreviewUrl: "",
        weatherSummary: "Rain, 11°C"
      }
    ];
    setActivities(demoActivities);
    setScreen("dashboard");
    alert("Demo activities loaded.");
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
                <p className="demo-badge">Demo Mode: no real account required</p>
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
                <p className="demo-badge">Demo Mode: no real account required</p>

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
            onLoadDemoActivities={handleLoadDemoActivities}
            onViewShare={handleGoToSharePage}
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

        {screen === "share" && (
          <SharePage
            parentName={parentName}
            onBack={handleBackToDashboard}
          />
        )}
      </div>
    </div>
  );
}

export default App;
