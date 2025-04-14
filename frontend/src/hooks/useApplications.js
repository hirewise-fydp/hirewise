import { useState, useEffect } from 'react';
import axiosInstance from '../axios/AxiosInstance';

export default function useApplications(jobId) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axiosInstance.get(`/api/v4/hr/getAllCandidate/${jobId}`);

        // Map API response to the expected format for the Table
        const mappedApplications = response.data.map(candidate => ({
          _id: candidate._id,
          jobId: candidate.job._id,
          name: candidate.candidateName,
          status: candidate.status,
          score: `${candidate.cvScore}%`, // Format score as percentage
        }));

        setApplications(mappedApplications);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch candidates');
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchApplications();
    } else {
      // If no jobId is provided, return an empty array
      setApplications([]);
      setLoading(false);
    }
  }, [jobId]);

  return { applications, loading, error };
}