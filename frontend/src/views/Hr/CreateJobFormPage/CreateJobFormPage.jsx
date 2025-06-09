"use client";

import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  message,
  Switch,
  Card,
  Slider,
  Row,
  DatePicker,
  Col,
  Typography,
  Space,
  Tooltip,
  Progress,
  Collapse,
  Tag,
  theme,
  Select,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  FileTextOutlined,
  SettingOutlined,
  PercentageOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { processJobDescription } from "../../../slices/jobSlice";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { useToken } = theme;

const CreateJobFormPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [customParameters, setCustomParameters] = useState([]);
  const [newParameter, setNewParameter] = useState("");
  const [remainingWeightage, setRemainingWeightage] = useState(0);
  const [formValues, setFormValues] = useState({
    weightage_skills: 30,
    weightage_experience: 30,
    weightage_education: 20,
    weightage_certifications: 20,
  });

  const { token } = useToken();
  const jobTypeOptions = [
    { value: "Onsite", label: "onsite" },
    { value: "Remote", label: "Remote" },
    { value: "Hybrid", label: "Hybrid" },
  ];
  const employmentTypeOptions = [
    { value: "FullTime", label: "FullTime" },
    { value: "PartTime", label: "PartTime" },
  ];

  // Calculate remaining weightage
  const calculateRemainingWeightage = (values) => {
    const standardParams = [
      "skills",
      "experience",
      "education",
      "certifications",
    ];
    let used = 0;

    standardParams.forEach((param) => {
      if (values?.[`weightage_${param}`]) {
        used += values[`weightage_${param}`];
      }
    });

    customParameters.forEach((param) => {
      if (values?.[`weightage_${param}`]) {
        used += values[`weightage_${param}`];
      }
    });

    return 100 - used;
  };

  // Update remaining weightage whenever form values change
  useEffect(() => {
    const remaining = calculateRemainingWeightage(formValues);
    setRemainingWeightage(remaining);
  }, [formValues, customParameters]);

  const handleFormValuesChange = (changedValues, allValues) => {
    setFormValues(allValues);
  };

  const addCustomParameter = () => {
    if (!newParameter.trim()) {
      message.error("Please enter a parameter name");
      return;
    }

    if (customParameters.includes(newParameter)) {
      message.error("This parameter already exists");
      return;
    }

    setCustomParameters([...customParameters, newParameter]);
    setNewParameter("");

    // Initialize the new parameter with 0 weightage
    form.setFieldsValue({
      [`weightage_${newParameter}`]: 0,
    });
  };

  const onFinish = async (values) => {
    const formData = new FormData();
    console.log("values:", values);

    // console.log(formData.get(jobType:String));

    formData.append("title", values.title);
    formData.append("jobType", values.jobType);
    formData.append("jobLocation", values.jobLocation);
    formData.append("startDate", values.startDate);
    formData.append("endDate", values.endDate);
    formData.append("employmentType", values.employmentType);
    formData.append("description", values.description || "");
    formData.append("modules[automatedTesting]", values.automatedTesting);

    const evaluationConfig = {
      skills: values.weightage_skills || 0,
      experience: values.weightage_experience || 0,
      education: values.weightage_education || 0,
      certifications: values.weightage_certifications || 0,
    };
    customParameters.forEach((param) => {
      evaluationConfig[param] = values[`weightage_${param}`] || 0;
    });
    formData.append("customParameters", JSON.stringify(customParameters));

    formData.append("evaluationConfig", JSON.stringify(evaluationConfig));

    // File upload
    const file = values.image?.[0]?.originFileObj;

    if (file) {
      formData.append("image", file);
    } else {
      message.error("Please upload a job description file.");
      return;
    }

    // Validate total weightage
    const totalUsed = Object.values(evaluationConfig).reduce(
      (sum, val) => sum + val,
      0
    );
    if (totalUsed !== 100) {
      message.error(
        `Total weightage must equal 100%. Current total: ${totalUsed}%`
      );
      return;
    }

    try {
      console.log("form data : ", formData);
      const resultAction = await dispatch(processJobDescription(formData));
      if (processJobDescription.fulfilled.match(resultAction)) {
        message.success("Job description processed successfully!");
        navigate("/create-form", { state: { jobId: resultAction.payload } });
      } else {
        message.error(
          resultAction.payload || "Failed to process job description."
        );
      }
    } catch (error) {
      message.error("An error occurred.");
    }
  };

  // Get progress status based on remaining weightage
  const getProgressStatus = () => {
    if (remainingWeightage === 0) return "success";
    if (remainingWeightage < 0) return "exception";
    return "active";
  };

  // Get color for the remaining weightage text
  const getWeightageColor = () => {
    if (remainingWeightage === 0) return token.colorSuccess;
    if (remainingWeightage < 0) return token.colorError;
    return token.colorPrimary;
  };

  return (
    <div
      style={{
        padding: "32px",
        background: "linear-gradient(to bottom, #f9fafc, #f0f2f5)",
        minHeight: "100vh",
      }}
    >
      <Row justify="center">
        <Col xs={24} sm={24} md={20} lg={18} xl={16}>
          <Card
            title={
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <FileTextOutlined
                  style={{ fontSize: "24px", color: token.colorPrimary }}
                />
                <Title level={3} style={{ margin: 0 }}>
                  Create New Job Position
                </Title>
              </div>
            }
            bordered={false}
            style={{
              boxShadow: "0 6px 16px rgba(0, 0, 0, 0.08)",
              borderRadius: "12px",
            }}
          >
            <Form
              form={form}
              name="create-job-form"
              onFinish={onFinish}
              layout="vertical"
              initialValues={{
                automatedTesting: false,
                weightage_skills: 30,
                weightage_experience: 30,
                weightage_education: 20,
                weightage_certifications: 20,
              }}
              onValuesChange={handleFormValuesChange}
            >
              <Collapse
                defaultActiveKey={["1", "2", "3"]}
                expandIconPosition="end"
                style={{
                  marginBottom: "24px",
                  background: token.colorBgContainer,
                  borderRadius: "8px",
                  border: `1px solid ${token.colorBorderSecondary}`,
                }}
              >
                <Panel
                  header={
                    <Space>
                      <FileTextOutlined />
                      <Text strong>Basic Information</Text>
                    </Space>
                  }
                  key="1"
                >
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item
                        label="Job Title"
                        name="title"
                        rules={[
                          {
                            required: true,
                            message: "Please input the job title!",
                          },
                        ]}
                      >
                        <Input
                          placeholder="Enter the job title"
                          size="large"
                          style={{ borderRadius: "6px" }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Collapse
                    defaultActiveKey={["jobPreferences"]}
                    expandIconPosition="end"
                    style={{
                      marginBottom: "16px",
                      background: token.colorBgContainer,
                      borderRadius: "8px",
                      border: `1px solid ${token.colorBorderSecondary}`,
                    }}
                  >
                    <Panel
                      header={
                        <Space>
                          <SettingOutlined />
                          <Text strong>Job Preferences</Text>
                        </Space>
                      }
                      key="jobPreferences"
                    >
                      <Row gutter={16}>
                        <Col span={24}>
                          <Form.Item
                            label="Location"
                            name="location"
                            rules={[
                              {
                                required: true,
                                message: "Please enter the location",
                              },
                            ]}
                          >
                            <Input
                              placeholder="Enter the location"
                              size="large"
                              style={{ borderRadius: "6px" }}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={24}>
                          <Form.Item
                            label="Job Type"
                            name="jobType"
                            rules={[
                              {
                                required: true,
                                message: "Please select the job type!",
                              },
                            ]}
                          >
                            <Select
                              placeholder="Please select Job Type"
                              style={{ width: "100%" }}
                              allowClear
                            >
                              {jobTypeOptions.map((option) => (
                                <Select.Option
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={24}>
                          <Form.Item
                            label="Employment Type"
                            name="employmentType"
                            rules={[
                              {
                                required: true,
                                message: "Please select the employment type!",
                              },
                            ]}
                          >
                            <Select
                              placeholder="Please select Employment Type"
                              style={{ width: "100%" }}
                              allowClear
                            >
                              {employmentTypeOptions.map((option) => (
                                <Select.Option
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                    </Panel>
                  </Collapse>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Start Date"
                        name="startDate"
                        rules={[
                          {
                            required: true,
                            message:
                              "Please select the job posting start date!",
                          },
                        ]}
                      >
                        <DatePicker
                          format="YYYY-MM-DD"
                          disabledDate={(current) =>
                            current && current < new Date().setHours(0, 0, 0, 0)
                          }
                          placeholder="Select start date"
                          size="large"
                          style={{ width: "100%", borderRadius: "6px" }}
                          onChange={(date) => {
                            // Reset end date if it is before the new start date
                            if (
                              date &&
                              form.getFieldValue("endDate") &&
                              date > form.getFieldValue("endDate")
                            ) {
                              form.setFieldsValue({ endDate: null });
                            }
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="End Date"
                        name="endDate"
                        rules={[
                          {
                            required: true,
                            message: "Please select the job posting end date!",
                          },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || !getFieldValue("startDate")) {
                                return Promise.resolve();
                              }
                              if (value <= getFieldValue("startDate")) {
                                return Promise.reject(
                                  new Error(
                                    "End date must be after start date!"
                                  )
                                );
                              }
                              return Promise.resolve();
                            },
                          }),
                        ]}
                      >
                        <DatePicker
                          format="YYYY-MM-DD"
                          disabledDate={(current) =>
                            current &&
                            current <= form.getFieldValue("startDate")
                          }
                          placeholder="Select end date"
                          size="large"
                          style={{ width: "100%", borderRadius: "6px" }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item
                        label="Job Description (Optional)"
                        name="description"
                      >
                        <Input.TextArea
                          placeholder="Enter a brief description of the job"
                          rows={3}
                          style={{ borderRadius: "6px" }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item
                        label="Upload Job Description File"
                        name="image"
                        valuePropName="fileList"
                        getValueFromEvent={(e) =>
                          Array.isArray(e) ? e : e?.fileList
                        }
                        rules={[
                          {
                            required: true,
                            message: "Please upload a job description file!",
                          },
                        ]}
                      >
                        <Upload
                          beforeUpload={() => false}
                          maxCount={1}
                          accept=".pdf,.doc,.docx,.txt"
                          listType="picture"
                        >
                          <Button
                            icon={<UploadOutlined />}
                            style={{
                              borderRadius: "6px",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            Click to Upload
                          </Button>
                        </Upload>
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>

                <Panel
                  header={
                    <Space>
                      <PercentageOutlined />
                      <Text strong>Evaluation Parameters</Text>
                      <Tag
                        color={
                          remainingWeightage === 0
                            ? "success"
                            : remainingWeightage < 0
                            ? "error"
                            : "processing"
                        }
                        style={{ marginLeft: "8px" }}
                      >
                        {remainingWeightage === 0
                          ? "Perfect Balance"
                          : remainingWeightage < 0
                          ? `${Math.abs(remainingWeightage)}% Over`
                          : `${remainingWeightage}% Remaining`}
                      </Tag>
                    </Space>
                  }
                  key="2"
                >
                  <div style={{ marginBottom: "24px" }}>
                    <Paragraph>
                      Set weightage for different parameters to evaluate
                      candidates. Total must equal 100%.
                    </Paragraph>

                    <div style={{ marginTop: "16px", marginBottom: "24px" }}>
                      <Progress
                        percent={100 - remainingWeightage}
                        status={getProgressStatus()}
                        strokeWidth={10}
                        style={{ marginBottom: "8px" }}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text>Total Allocated</Text>
                        <Text strong style={{ color: getWeightageColor() }}>
                          {100 - remainingWeightage}%
                        </Text>
                      </div>
                    </div>
                  </div>

                  <Row gutter={[24, 24]}>
                    <Col xs={24} sm={12}>
                      <Card
                        size="small"
                        title={
                          <Space>
                            <BulbOutlined />
                            <Text strong>Skills</Text>
                          </Space>
                        }
                        extra={
                          <Text type="secondary">
                            {formValues.weightage_skills}%
                          </Text>
                        }
                        style={{ borderRadius: "8px" }}
                      >
                        <Tooltip title="Technical skills, soft skills, etc.">
                          <Paragraph
                            type="secondary"
                            style={{ marginBottom: "16px" }}
                          >
                            Evaluate candidates based on their technical and
                            soft skills
                          </Paragraph>
                        </Tooltip>
                        <Form.Item name="weightage_skills" noStyle>
                          <Slider
                            min={0}
                            max={100}
                            marks={{ 0: "0%", 50: "50%", 100: "100%" }}
                            tooltip={{ formatter: (value) => `${value}%` }}
                          />
                        </Form.Item>
                      </Card>
                    </Col>

                    <Col xs={24} sm={12}>
                      <Card
                        size="small"
                        title={
                          <Space>
                            <BulbOutlined />
                            <Text strong>Experience</Text>
                          </Space>
                        }
                        extra={
                          <Text type="secondary">
                            {formValues.weightage_experience}%
                          </Text>
                        }
                        style={{ borderRadius: "8px" }}
                      >
                        <Tooltip title="Work history, relevant experience, etc.">
                          <Paragraph
                            type="secondary"
                            style={{ marginBottom: "16px" }}
                          >
                            Evaluate candidates based on their work history and
                            relevant experience
                          </Paragraph>
                        </Tooltip>
                        <Form.Item name="weightage_experience" noStyle>
                          <Slider
                            min={0}
                            max={100}
                            marks={{ 0: "0%", 50: "50%", 100: "100%" }}
                            tooltip={{ formatter: (value) => `${value}%` }}
                          />
                        </Form.Item>
                      </Card>
                    </Col>

                    <Col xs={24} sm={12}>
                      <Card
                        size="small"
                        title={
                          <Space>
                            <BulbOutlined />
                            <Text strong>Education</Text>
                          </Space>
                        }
                        extra={
                          <Text type="secondary">
                            {formValues.weightage_education}%
                          </Text>
                        }
                        style={{ borderRadius: "8px" }}
                      >
                        <Tooltip title="Degrees, academic achievements, etc.">
                          <Paragraph
                            type="secondary"
                            style={{ marginBottom: "16px" }}
                          >
                            Evaluate candidates based on their educational
                            background and academic achievements
                          </Paragraph>
                        </Tooltip>
                        <Form.Item name="weightage_education" noStyle>
                          <Slider
                            min={0}
                            max={100}
                            marks={{ 0: "0%", 50: "50%", 100: "100%" }}
                            tooltip={{ formatter: (value) => `${value}%` }}
                          />
                        </Form.Item>
                      </Card>
                    </Col>

                    <Col xs={24} sm={12}>
                      <Card
                        size="small"
                        title={
                          <Space>
                            <BulbOutlined />
                            <Text strong>Certifications</Text>
                          </Space>
                        }
                        extra={
                          <Text type="secondary">
                            {formValues.weightage_certifications}%
                          </Text>
                        }
                        style={{ borderRadius: "8px" }}
                      >
                        <Tooltip title="Professional certifications, courses, etc.">
                          <Paragraph
                            type="secondary"
                            style={{ marginBottom: "16px" }}
                          >
                            Evaluate candidates based on their professional
                            certifications and completed courses
                          </Paragraph>
                        </Tooltip>
                        <Form.Item name="weightage_certifications" noStyle>
                          <Slider
                            min={0}
                            max={100}
                            marks={{ 0: "0%", 50: "50%", 100: "100%" }}
                            tooltip={{ formatter: (value) => `${value}%` }}
                          />
                        </Form.Item>
                      </Card>
                    </Col>

                    {customParameters.map((param) => (
                      <Col xs={24} sm={12} key={param}>
                        <Card
                          size="small"
                          title={
                            <Space>
                              <BulbOutlined />
                              <Text strong>{param}</Text>
                            </Space>
                          }
                          extra={
                            <Text type="secondary">
                              {formValues[`weightage_${param}`] || 0}%
                            </Text>
                          }
                          style={{ borderRadius: "8px" }}
                        >
                          <Paragraph
                            type="secondary"
                            style={{ marginBottom: "16px" }}
                          >
                            Custom evaluation parameter
                          </Paragraph>
                          <Form.Item
                            name={`weightage_${param}`}
                            noStyle
                            initialValue={0}
                          >
                            <Slider
                              min={0}
                              max={100}
                              marks={{ 0: "0%", 50: "50%", 100: "100%" }}
                              tooltip={{ formatter: (value) => `${value}%` }}
                            />
                          </Form.Item>
                        </Card>
                      </Col>
                    ))}
                  </Row>

                  <div style={{ marginTop: "24px" }}>
                    <Row gutter={8}>
                      <Col flex="auto">
                        <Input
                          placeholder="Add custom evaluation parameter"
                          value={newParameter}
                          onChange={(e) => setNewParameter(e.target.value)}
                          onPressEnter={addCustomParameter}
                          style={{ borderRadius: "6px" }}
                        />
                      </Col>
                      <Col>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={addCustomParameter}
                          style={{
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          Add Parameter
                        </Button>
                      </Col>
                    </Row>
                  </div>
                </Panel>

                <Panel
                  header={
                    <Space>
                      <SettingOutlined />
                      <Text strong>Additional Settings</Text>
                    </Space>
                  }
                  key="3"
                >
                  <Card size="small" style={{ borderRadius: "8px" }}>
                    <Form.Item
                      label={
                        <Space>
                          <Text strong>Automated Testing Module</Text>
                        </Space>
                      }
                      name="automatedTesting"
                      valuePropName="checked"
                      extra="Enable automated skills assessment for candidates"
                    >
                      <Switch
                        checkedChildren="Enabled"
                        unCheckedChildren="Disabled"
                      />
                    </Form.Item>
                  </Card>
                </Panel>
              </Collapse>

              <Form.Item style={{ marginTop: "32px" }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  style={{
                    height: "48px",
                    borderRadius: "8px",
                    fontSize: "16px",
                  }}
                  disabled={remainingWeightage !== 0}
                >
                  {remainingWeightage !== 0
                    ? `Adjust Weightage (${
                        remainingWeightage > 0
                          ? `${remainingWeightage}% Remaining`
                          : `${Math.abs(remainingWeightage)}% Over`
                      })`
                    : "Create Job"}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CreateJobFormPage;
