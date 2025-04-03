import { useState, useEffect } from 'react';

const mockApplications = [
  { id: 1, jobId: 1, name: "John Doe", status: "Screened", score: "85%" },
  { id: 2, jobId: 1, name: "Jane Smith", status: "Tested", score: "92%" },
  { id: 3, jobId: 2, name: "Bob Johnson", status: "Rejected", score: "60%" }
];

export default function useApplications(jobId) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with actual API call
    setTimeout(() => {
      const filtered = jobId 
        ? mockApplications.filter(app => app.jobId === jobId)
        : mockApplications;
      setApplications(filtered);
      setLoading(false);
    }, 500);
  }, [jobId]);

  return { applications, loading };
}