import { useState, useEffect } from 'react';
import axiosInstance from '../axios/AxiosInstance';

export default function useApplications(jobId) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false); // Initialize as false
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!jobId) {
        setApplications([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await axiosInstance.get(`/api/v4/hr/getAllCandidate/${jobId}`);

        // Enhanced data mapping
        const mappedApplications = response.data.map(candidate => ({
          _id: candidate._id,
          jobId: candidate.job?._id,
          name: candidate.candidateName || "Unknown",
          candidateEmail: candidate.candidateEmail || "",
          candidatePhone: candidate.candidatePhone || "",
          status: candidate.status || "unknown",
          score: candidate.cvScore ? `${candidate.cvScore}` : "0", // Remove % as it's handled in UI
          testScore: candidate.testScore ? `${candidate.testScore}` : null,
          applicationDate: candidate.applicationDate || null,
          cvFile: candidate.cvFile || null,
        }));

        setApplications(mappedApplications);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch candidates');
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [jobId]);

  return { applications, loading, error };
}