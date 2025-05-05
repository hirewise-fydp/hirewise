import { useNavigate } from "react-router-dom"
import JobsList from "../../components/jobs/jobs-list"

const JobsScreen = () => {
  const navigate = useNavigate()

  const handleManageJob = (jobId) => {
    navigate(`/dashboard/applicants/${jobId}`)
  }

  return <JobsList onManageJob={handleManageJob} />
}

export default JobsScreen
