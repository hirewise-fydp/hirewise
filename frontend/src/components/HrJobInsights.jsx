import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../styles/HrJobInsights.css"; // Custom CSS for the drawer

const HRJobInsights = () => {
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: "Software Engineer",
      insights: [
        { candidate: "Alice Johnson", score: 85 },
        { candidate: "Bob Smith", score: 78 },
        { candidate: "Charlie Brown", score: 92 },
      ],
    },
    {
      id: 2,
      title: "Data Analyst",
      insights: [
        { candidate: "David Green", score: 88 },
        { candidate: "Emma White", score: 90 },
      ],
    },
    {
      id: 3,
      title: "Product Manager",
      insights: [
        { candidate: "Frank Black", score: 80 },
        { candidate: "Grace Blue", score: 70 },
        { candidate: "Helen Grey", score: 95 },
      ],
    },
  ]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const openDrawer = (job) => {
    setSelectedJob(job);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedJob(null);
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Jobs Posted</h2>
      <div className="list-group">
        {jobs.map((job) => (
          <button
            key={job.id}
            className="list-group-item list-group-item-action"
            onClick={() => openDrawer(job)}
          >
            {job.title}
          </button>
        ))}
      </div>

      {drawerOpen && (
        <div className="drawer">
          <div className="drawer-header">
            <h4>{selectedJob?.title} Insights</h4>
            <button className="btn-close" onClick={closeDrawer}></button>
          </div>
          <div className="drawer-body">
            {selectedJob?.insights?.length ? (
              <ul className="list-group">
                {selectedJob.insights.map((insight, index) => (
                  <li key={index} className="list-group-item">
                    <strong>{insight.candidate}</strong>
                    <span className="badge bg-primary ms-2">
                      Score: {insight.score}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No insights available for this job.</p>
            )}
          </div>
        </div>
      )}
      {drawerOpen && <div className="drawer-overlay" onClick={closeDrawer}></div>}
    </div>
  );
};

export default HRJobInsights;
