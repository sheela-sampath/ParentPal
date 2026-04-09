import React from "react";

function SharePage({ parentName, onBack }) {
  return (
    <div>
      <p className="step-chip">Pitch & Share</p>
      <h2 className="section-title">Share ParentPal Demo</h2>
      <p className="section-subtitle">
        Use this page when presenting your product. It includes quick demo credentials and pitch text.
      </p>

      <div className="info-card">
        <h3 className="section-title">Project Intro</h3>
        <p className="meta-text">
          ParentPal helps busy parents organize child activities, generate weather-aware checklists, and track
          completion in one mobile-friendly assistant.
        </p>
      </div>

      <div className="info-card">
        <h3 className="section-title">Demo Credentials</h3>
        <p className="meta-text"><strong>Name:</strong> {parentName || "Demo Parent"}</p>
        <p className="meta-text"><strong>Email:</strong> demo@parentpal.app</p>
        <p className="meta-text"><strong>Password:</strong> demo123</p>
        <p className="meta-text">Demo mode is simulated with local storage only.</p>
      </div>

      <div className="info-card">
        <h3 className="section-title">Deployment Link Placeholder</h3>
        <p className="meta-text">
          After deployment, replace this with your public URL from Vercel or Netlify.
        </p>
        <p className="meta-text"><strong>Example:</strong> https://parentpal-demo.vercel.app</p>
      </div>

      <div className="btn-row">
        <button className="btn btn-primary" onClick={onBack}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default SharePage;
