"use client";

import { useState, useEffect } from "react";
import axiosInstance from "../axios/AxiosInstance";
import { useSelector } from "react-redux";

export default function useJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);

  const [error, setError] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(`/api/v4/hr/findAll/${user.id}`);

      // Enhance job data with candidate counts (this would typically come from the API)
      const enhancedJobs = (response.data || []).map((job) => ({
        ...job,
      }));


      setJobs(enhancedJobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError(error.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Add a function to refresh jobs
  const refreshJobs = () => {
    return fetchJobs();
  };

  return {
    jobs,
    setJobs,
    loading,
    error,
    refreshJobs,
  };
}
