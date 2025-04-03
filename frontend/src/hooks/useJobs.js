import { useState, useEffect } from 'react';
import axiosInstance from '../axios/AxiosInstance';

export default function useJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const response = await axiosInstance.get(`http://localhost:5000/api/v4/hr/findAll`);
      console.log('response', response.data);

      setJobs(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchJobs();
    };

    fetchData();
  }, []); 

  return { jobs,setJobs, loading };
}
