"use client"
import { useParams, useNavigate } from "react-router-dom"
import CandidateList from "../../components/candidates/candidate-list"

const ApplicantsScreen = () => {
  const { jobId } = useParams()
  const navigate = useNavigate()

  const handleBack = () => {
    navigate("/dashboard/jobs")
  }

  return <CandidateList jobId={jobId} onBack={handleBack} />
}

export default ApplicantsScreen
