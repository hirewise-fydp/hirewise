import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../axios/AxiosInstance';

export default function useApplications(jobId) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchApplications = useCallback(async () => {
    if (!jobId) {
      setApplications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(`/api/v4/hr/getAllCandidate/${jobId}`);
      console.log('Fetched applications:', response.data);

      // Enhanced data mapping
      const mappedApplications = response.data.map(candidate => ({
        _id: candidate._id,
        jobId: candidate.job?._id,
        name: candidate.candidateName || "Unknown",
        candidateName: candidate.candidateName || "Unknown", // Keep both for compatibility
        candidateEmail: candidate.candidateEmail || "",
        candidatePhone: candidate.candidatePhone || "",
        status: candidate.status || "unknown",
        skillsMatch: candidate.evaluationResults?.skillMatches || 0,
        cvScore: candidate.cvScore ? `${candidate.cvScore}` : "0",
        testScore: candidate.testScore ? `${candidate.testScore}` : null,
        applicationDate: candidate.applicationDate || null,
        cvFile: candidate.cvFile || null,
        // Include additional fields for enhanced filtering
        parsedResume: candidate.parsedResume || {},
        evaluationResults: candidate.evaluationResults || {},
        testStartedAt: candidate.testStartedAt || null,
        testSubmittedAt: candidate.testSubmittedAt || null,
        testToken: candidate.testToken || null,
        testTokenExpires: candidate.testTokenExpires || null,
        dataRetention: candidate.dataRetention || {},
      }));

      console.log('mappedApplications:', mappedApplications);
      setApplications(mappedApplications);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch candidates');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  // Initial fetch on mount or when jobId changes
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Refetch method that can be called manually
  const refetch = useCallback(async () => {
    await fetchApplications();
  }, [fetchApplications]);

  return { 
    applications, 
    loading, 
    error, 
    refetch 
  };
}