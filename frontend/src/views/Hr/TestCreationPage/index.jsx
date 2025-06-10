"use client"

import { useState, useEffect } from "react"
import {
  Steps,
  Card,
  Button,
  Radio,
  Form,
  Input,
  Select,
  InputNumber,
  Space,
  Typography,
  Divider,
  Row,
  Col,
  Alert,
  Spin,
  Table,
  Tag,
  Modal,
  message,
  Collapse,
  Empty, // Import Empty component
  Tooltip,
} from "antd"
import {
  FormOutlined,
  RobotOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons"
import { useParams, useNavigate } from "react-router-dom"
import axiosInstance from "../../../axios/AxiosInstance"

const { Title, Text, Paragraph } = Typography
const { Step } = Steps
const { Option } = Select
const { Panel } = Collapse

const TestCreationFlow = () => {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [questionForm] = Form.useForm()

  // State variables
  const [currentStep, setCurrentStep] = useState(0)
  const [testType, setTestType] = useState(null)
  const [jobDetails, setJobDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [generatingQuestions, setGeneratingQuestions] = useState(false)
  const [aiQuestions, setAiQuestions] = useState([])
  const [testConfig, setTestConfig] = useState({
    experience: "entry-level",
    conceptualQuestions: 5,
    logicalQuestions: 3,
    basicQuestions: 2,
    difficultyLevel: "medium",
  })
  console.log("Test Config:", testConfig);
  
  const [manualQuestions, setManualQuestions] = useState([])
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [error, setError] = useState(null)

  // Fetch job details
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true)
        const response = await axiosInstance.get(`/api/v4/hr/findJd/${jobId}`)
        setJobDetails(response.data)
      } catch (err) {
        const errorMsg = err.response?.data?.message || "Failed to load job details. Please try again."
        setError(errorMsg)
        console.error("Error fetching job details:", err)
      } finally {
        setLoading(false)
      }
    }

    if (jobId) {
      fetchJobDetails()
    }
  }, [jobId])

  // Check if test already exists
  useEffect(() => {
    if (jobDetails?.testCreated) {
      message.info("A test has already been created for this job position.")
      navigate(`/jobs/${jobId}`)
    }
  }, [jobDetails, jobId, navigate])

  // Handle test type selection
  const handleTestTypeChange = (e) => {
    setTestType(e.target.value)
  }

  // Handle next step
  const handleNext = () => {
    if (currentStep === 0 && !testType) {
      message.error("Please select a test creation method")
      return
    }

    if (currentStep === 1 && testType === "manual" && manualQuestions.length === 0) {
      message.error("Please add at least one question")
      return
    }

    if (currentStep === 1 && testType === "ai") {
      form.validateFields().then((values) => {
        setTestConfig(values)
        generateAIQuestions(values)
      })
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
  }

  // Generate AI questions
  const generateAIQuestions = async (config) => {
    try {
      setGeneratingQuestions(true)
      setError(null)

      const response = await axiosInstance.post("/api/v4/hr/tests/ai/generate", {
        job: jobId,
        testConfig: config,
      })

      setAiQuestions(response.data.questions)
      setCurrentStep(currentStep + 1)
    } catch (err) {
      setError("Failed to generate questions. Please try again.")
      console.error("Error generating AI questions:", err)
    } finally {
      setGeneratingQuestions(false)
    }
  }

  // Regenerate AI questions
  const handleRegenerateQuestions = () => {
    generateAIQuestions(testConfig)
  }

  // Add manual question
  const handleAddQuestion = () => {
    setEditingQuestion(null)
    questionForm.resetFields()
    setIsModalVisible(true)
  }

  // Edit manual question
  const handleEditQuestion = (question, index) => {
    setEditingQuestion({ ...question, index })
    questionForm.setFieldsValue({
      questionText: question.questionText,
      questionType: question.questionType,
      options: question.options,
      correctAnswer: question.correctAnswer,
    })
    setIsModalVisible(true)
  }

  // Delete manual question
  const handleDeleteQuestion = (index) => {
    const updatedQuestions = [...manualQuestions]
    updatedQuestions.splice(index, 1)
    setManualQuestions(updatedQuestions)
  }

  // Save question from modal
  const handleSaveQuestion = () => {
    questionForm.validateFields().then((values) => {
      if (editingQuestion !== null) {
        // Update existing question
        const updatedQuestions = [...manualQuestions]
        updatedQuestions[editingQuestion.index] = values
        setManualQuestions(updatedQuestions)
      } else {
        // Add new question
        setManualQuestions([...manualQuestions, values])
      }
      setIsModalVisible(false)
    })
  }

  // Submit manual test
  const handleSubmitManualTest = async () => {
    try {
      setSubmitting(true)
      setError(null)

      await axiosInstance.post("/api/v4/hr/tests/manual", {
        job: jobId,
        questions: manualQuestions,
      })

      message.success("Test created successfully!")
      navigate(`/jobs/${jobId}`)
    } catch (err) {
      setError("Failed to create test. Please try again.")
      console.error("Error creating manual test:", err)
    } finally {
      setSubmitting(false)
    }
  }

  // Submit AI test
  const handleSubmitAITest = async () => {
    try {
      setSubmitting(true)
      setError(null)

      await axiosInstance.post("/api/v4/hr/tests/ai/save", {
        job: jobId,
        questions: aiQuestions,
        testConfig,
      })

      message.success("Test created successfully!")
      navigate(`/jobs/${jobId}`)
    } catch (err) {
      setError("Failed to create test. Please try again.")
      console.error("Error saving AI test:", err)
    } finally {
      setSubmitting(false)
    }
  }

  // Question columns for table
  const questionColumns = [
    {
      title: "Question",
      dataIndex: "questionText",
      key: "questionText",
      width: "40%",
      render: (text) => <div style={{ whiteSpace: "pre-wrap" }}>{text}</div>,
    },
    {
      title: "Type",
      dataIndex: "questionType",
      key: "questionType",
      width: "15%",
      render: (type) => {
        const colors = {
          conceptual: "blue",
          logical: "purple",
          basic: "green",
        }
        return <Tag color={colors[type]}>{type.toUpperCase()}</Tag>
      },
    },
    {
      title: "Options",
      dataIndex: "options",
      key: "options",
      width: "25%",
      render: (options, record) => (
        <ul style={{ paddingLeft: "20px", margin: 0 }}>
          {options.map((option, index) => (
            <li key={index} style={{ color: option === record.correctAnswer ? "#52c41a" : "inherit" }}>
              {option}
              {option === record.correctAnswer && " ✓"}
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: "20%",
      render: (_, record, index) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditQuestion(record, index)}
            disabled={testType === "ai"}
          />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDeleteQuestion(index)}
            disabled={testType === "ai"}
          />
        </Space>
      ),
    },
  ]

  // Render loading state
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="test-creation-flow">
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
          onClose={() => setError(null)}
        />
      )}

      <Card
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              icon={<ArrowLeftOutlined />}
              style={{ marginRight: 16 }}
              onClick={() => navigate(`/jobs/${jobId}`)}
            />
            <Title level={4} style={{ margin: 0 }}>
              Create Test for {jobDetails?.jobTitle}
            </Title>
          </div>
        }
      >
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          <Step title="Select Method" description="Choose creation method" />
          <Step
            title={testType === "manual" ? "Add Questions" : "Configure Test"}
            description={testType === "manual" ? "Create questions" : "Set parameters"}
          />
          <Step title="Review" description="Review and submit" />
        </Steps>

        <div className="steps-content" style={{ marginTop: 24 }}>
          {/* Step 1: Select Test Creation Method */}
          {currentStep === 0 && (
            <div className="test-type-selection">
              <Paragraph>
                Select how you want to create the test for candidates applying to this position. You can either create
                questions manually or let AI generate questions based on the job requirements.
              </Paragraph>

              <Row gutter={16} style={{ marginTop: 24 }}>
                <Col xs={24} md={12}>
                  <Card
                    hoverable
                    style={{
                      borderColor: testType === "manual" ? "#1890ff" : undefined,
                      backgroundColor: testType === "manual" ? "#e6f7ff" : undefined,
                    }}
                    onClick={() => setTestType("manual")}
                  >
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <FormOutlined style={{ fontSize: 48, color: "#1890ff", marginBottom: 16 }} />
                      <Title level={4}>Manual Creation</Title>
                      <Paragraph>
                        Create test questions manually with full control over question content, options, and correct
                        answers.
                      </Paragraph>
                      <Radio checked={testType === "manual"} onChange={handleTestTypeChange} value="manual">
                        Select Manual Creation
                      </Radio>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card
                    hoverable
                    style={{
                      borderColor: testType === "ai" ? "#1890ff" : undefined,
                      backgroundColor: testType === "ai" ? "#e6f7ff" : undefined,
                    }}
                    onClick={() => setTestType("ai")}
                  >
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <RobotOutlined style={{ fontSize: 48, color: "#1890ff", marginBottom: 16 }} />
                      <Title level={4}>AI-Assisted Creation</Title>
                      <Paragraph>
                        Let AI generate relevant test questions based on job requirements and your specifications.
                      </Paragraph>
                      <Radio checked={testType === "ai"} onChange={handleTestTypeChange} value="ai">
                        Select AI-Assisted Creation
                      </Radio>
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>
          )}

          {/* Step 2: Manual Question Creation or AI Configuration */}
          {currentStep === 1 && testType === "manual" && (
            <div className="manual-question-creation">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <Title level={5}>Test Questions ({manualQuestions.length})</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddQuestion}>
                  Add Question
                </Button>
              </div>

              {manualQuestions.length === 0 ? (
                <Empty
                  description="No questions added yet"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ margin: "40px 0" }}
                />
              ) : (
                <Table
                  dataSource={manualQuestions}
                  columns={questionColumns}
                  rowKey={(record, index) => index}
                  pagination={false}
                />
              )}

              <Alert
                message="Question Guidelines"
                description={
                  <ul>
                    <li>Create a mix of conceptual, logical, and basic questions</li>
                    <li>Each question must have exactly 4 options</li>
                    <li>Ensure questions are relevant to the job requirements</li>
                    <li>Avoid ambiguous or overly complex questions</li>
                  </ul>
                }
                type="info"
                showIcon
                style={{ marginTop: 24 }}
              />
            </div>
          )}

          {currentStep === 1 && testType === "ai" && (
            <div className="ai-test-configuration">
              <Paragraph>
                Configure the AI to generate test questions based on your requirements. The AI will create questions
                relevant to the job position and skills needed.
              </Paragraph>

              <Form
                form={form}
                layout="vertical"
                initialValues={testConfig}
                onFinish={(values) => {
                  setTestConfig(values)
                  generateAIQuestions(values)
                }}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="experience"
                      label="Experience Level"
                      rules={[{ required: true, message: "Please select experience level" }]}
                    >
                      <Select placeholder="Select experience level">
                        <Option value="entry-level">Entry Level (0-2 years)</Option>
                        <Option value="mid-level">Mid Level (3-5 years)</Option>
                        <Option value="senior">Senior (5+ years)</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="difficultyLevel"
                      label="Difficulty Level"
                      rules={[{ required: true, message: "Please select difficulty level" }]}
                    >
                      <Select placeholder="Select difficulty level">
                        <Option value="easy">Easy</Option>
                        <Option value="medium">Medium</Option>
                        <Option value="hard">Hard</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Divider>Question Distribution</Divider>

                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="conceptualQuestions"
                      label={
                        <span>
                          Conceptual Questions{" "}
                          <Tooltip title="Questions testing theoretical knowledge and understanding of concepts">
                            <QuestionCircleOutlined />
                          </Tooltip>
                        </span>
                      }
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <InputNumber min={0} max={10} style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="logicalQuestions"
                      label={
                        <span>
                          Logical Questions{" "}
                          <Tooltip title="Questions testing problem-solving and logical reasoning abilities">
                            <QuestionCircleOutlined />
                          </Tooltip>
                        </span>
                      }
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <InputNumber min={0} max={10} style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="basicQuestions"
                      label={
                        <span>
                          Basic Questions{" "}
                          <Tooltip title="Fundamental questions testing essential knowledge">
                            <QuestionCircleOutlined />
                          </Tooltip>
                        </span>
                      }
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <InputNumber min={0} max={10} style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Alert
                  message="Job Skills"
                  description={
                    <div>
                      <p>The AI will generate questions based on these skills from the job description:</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                        {jobDetails?.qualifications?.skills?.map((skill, index) => (
                          <Tag key={index} color="blue">
                            {skill}
                          </Tag>
                        ))}
                        {(!jobDetails?.qualifications?.skills || jobDetails.qualifications.skills.length === 0) && (
                          <Text type="secondary">No skills specified in job description</Text>
                        )}
                      </div>
                    </div>
                  }
                  type="info"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              </Form>
            </div>
          )}

          {/* Step 3: Review and Submit */}
          {currentStep === 2 && (
            <div className="test-review">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <Title level={5}>
                  Review {testType === "manual" ? "Manual" : "AI-Generated"} Test (
                  {testType === "manual" ? manualQuestions.length : aiQuestions.length} questions)
                </Title>
                {testType === "ai" && (
                  <Button icon={<ReloadOutlined />} onClick={handleRegenerateQuestions} loading={generatingQuestions}>
                    Regenerate Questions
                  </Button>
                )}
              </div>

              {testType === "ai" && (
                <Alert
                  message="AI-Generated Questions"
                  description="These questions were generated based on your configuration. You can regenerate them if needed, but cannot edit individual questions."
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}

              <Collapse defaultActiveKey={["1"]} style={{ marginBottom: 16 }}>
                <Panel header="Test Configuration" key="1">
                  <Row gutter={16}>
                    <Col span={8}>
                      <Text strong>Test Type:</Text> {testType === "manual" ? "Manual" : "AI-Generated"}
                    </Col>
                    {testType === "ai" && (
                      <>
                        <Col span={8}>
                          <Text strong>Experience Level:</Text>{" "}
                          {testConfig.experience === "entry-level"
                            ? "Entry Level (0-2 years)"
                            : testConfig.experience === "mid-level"
                              ? "Mid Level (3-5 years)"
                              : "Senior (5+ years)"}
                        </Col>
                        <Col span={8}>
                          <Text strong>Difficulty:</Text>{" "}
                          {testConfig.difficultyLevel.charAt(0).toUpperCase() + testConfig.difficultyLevel.slice(1)}
                        </Col>
                      </>
                    )}
                  </Row>
                  {testType === "ai" && (
                    <Row gutter={16} style={{ marginTop: 16 }}>
                      <Col span={8}>
                        <Text strong>Conceptual Questions:</Text> {testConfig.conceptualQuestions}
                      </Col>
                      <Col span={8}>
                        <Text strong>Logical Questions:</Text> {testConfig.logicalQuestions}
                      </Col>
                      <Col span={8}>
                        <Text strong>Basic Questions:</Text> {testConfig.basicQuestions}
                      </Col>
                    </Row>
                  )}
                </Panel>
              </Collapse>

              <Table
                dataSource={testType === "manual" ? manualQuestions : aiQuestions}
                columns={questionColumns}
                rowKey={(record, index) => index}
                pagination={{ pageSize: 5 }}
              />
            </div>
          )}
        </div>

        <div className="steps-action" style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>
          {currentStep > 0 && (
            <Button onClick={handlePrevious} disabled={submitting || generatingQuestions}>
              Previous
            </Button>
          )}
          <div style={{ marginLeft: "auto" }}>
            {currentStep < 2 && (
              <Button type="primary" onClick={handleNext} loading={generatingQuestions}>
                {currentStep === 1 && testType === "ai" ? "Generate Questions" : "Next"}
              </Button>
            )}
            {currentStep === 2 && (
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={testType === "manual" ? handleSubmitManualTest : handleSubmitAITest}
                loading={submitting}
              >
                Create Test
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Question Modal */}
      <Modal
        title={editingQuestion ? "Edit Question" : "Add Question"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={handleSaveQuestion}>
            Save
          </Button>,
        ]}
        width={700}
      >
        <Form form={questionForm} layout="vertical">
          <Form.Item
            name="questionText"
            label="Question"
            rules={[{ required: true, message: "Please enter the question" }]}
          >
            <Input.TextArea rows={4} placeholder="Enter the question text" />
          </Form.Item>

          <Form.Item
            name="questionType"
            label="Question Type"
            rules={[{ required: true, message: "Please select question type" }]}
          >
            <Select placeholder="Select question type">
              <Option value="conceptual">Conceptual</Option>
              <Option value="logical">Logical</Option>
              <Option value="basic">Basic</Option>
            </Select>
          </Form.Item>

          <Form.List
            name="options"
            rules={[
              {
                validator: async (_, options) => {
                  if (!options || options.length !== 4) {
                    return Promise.reject(new Error("Please provide exactly 4 options"))
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map((field, index) => (
                  <Form.Item
                    required={false}
                    key={field.key}
                    label={index === 0 ? "Options" : ""}
                    validateStatus={field.errors ? "error" : ""}
                    help={field.errors?.join(", ")}
                  >
                    <Form.Item
                      {...field}
                      validateTrigger={["onChange", "onBlur"]}
                      rules={[
                        {
                          required: true,
                          whitespace: true,
                          message: "Please input option content",
                        },
                      ]}
                      noStyle
                    >
                      <Input
                        placeholder={`Option ${index + 1}`}
                        style={{ width: "90%" }}
                        addonBefore={`${String.fromCharCode(65 + index)}.`}
                      />
                    </Form.Item>
                    {fields.length > 1 ? (
                      <DeleteOutlined
                        className="dynamic-delete-button"
                        style={{ margin: "0 8px" }}
                        onClick={() => remove(field.name)}
                      />
                    ) : null}
                  </Form.Item>
                ))}
                {fields.length < 4 ? (
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} style={{ width: "60%" }} icon={<PlusOutlined />}>
                      Add Option
                    </Button>
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                ) : null}
              </>
            )}
          </Form.List>

          <Form.Item
            name="correctAnswer"
            label="Correct Answer"
            rules={[
              { required: true, message: "Please select the correct answer" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const options = getFieldValue("options") || []
                  if (!value || options.includes(value)) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error("Correct answer must be one of the options"))
                },
              }),
            ]}
          >
            <Select placeholder="Select the correct answer">
              {questionForm.getFieldValue("options")?.map((option, index) => (
                <Option key={index} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TestCreationFlow
