import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form, Radio, InputNumber, Select, Button, message, Card, Space, Input, Modal } from 'antd';
import './styles.css';

const { Option } = Select;
const { TextArea } = Input;

const TestCreationPage = () => {
  const [testMode, setTestMode] = useState('manual');
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [showQuestionTypes, setShowQuestionTypes] = useState(false);
  const [questionTypes, setQuestionTypes] = useState([]);
  const [manualQuestions, setManualQuestions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({ text: '', type: 'theoretical' });
  const location = useLocation();
  const navigate = useNavigate();
  const jobId = location.state?.jobId;
  const [form] = Form.useForm();

  // Validate question type counts
  const validateQuestionTypes = () => {
    const totalTypeCount = questionTypes.reduce((sum, qt) => sum + (qt.count || 0), 0);
    if (totalTypeCount > totalQuestions) {
      message.error('Total number of questions by type cannot exceed the total number of questions.');
      return false;
    }
    return true;
  };

  const handleAddQuestionType = () => {
    setQuestionTypes([...questionTypes, { type: '', count: 0 }]);
  };

  const handleRemoveQuestionType = (index) => {
    setQuestionTypes(questionTypes.filter((_, i) => i !== index));
  };

  const handleQuestionTypeChange = (index, field, value) => {
    const updatedTypes = [...questionTypes];
    updatedTypes[index][field] = value;
    setQuestionTypes(updatedTypes);
  };

  const handleTotalQuestionsChange = (value) => {
    setTotalQuestions(value || 0);
    if (questionTypes.length > 0) {
      const totalTypeCount = questionTypes.reduce((sum, qt) => sum + (qt.count || 0), 0);
      if (totalTypeCount > value) {
        message.warning('Adjusting question type counts to match the new total.');
        setQuestionTypes(questionTypes.map(qt => ({ ...qt, count: 0 })));
      }
    }
  };

  const handleAddManualQuestion = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    if (!currentQuestion.text) {
      message.error('Question text is required.');
      return;
    }
    setManualQuestions([...manualQuestions, currentQuestion]);
    setCurrentQuestion({ text: '', type: 'theoretical' });
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setCurrentQuestion({ text: '', type: 'theoretical' });
    setIsModalVisible(false);
  };

  const handleRemoveManualQuestion = (index) => {
    setManualQuestions(manualQuestions.filter((_, i) => i !== index));
  };

  const onFinish = (values) => {
    console.log("on submit")
    if (testMode === 'ai') {
      if (!showQuestionTypes) {
        message.error('Please specify if you want to add question types.');
        return;
      }
      if (questionTypes.length > 0 && !validateQuestionTypes()) {
        return;
      }
      if (questionTypes.some(qt => !qt.type && qt.count > 0)) {
        message.error('Please select a question type for all specified counts.');
        return;
      }
    }

    const payload = {
      jobId,
      testMode,
      ...(testMode === 'ai'
        ? {
          totalQuestions: values.totalQuestions,
          difficulty: values.difficulty,
          questionTypes: questionTypes.filter((qt) => qt.type && qt.count > 0),
        }
        : {
          questions: manualQuestions,
        }),
    };

    // Simulate API call
    console.log('Submitting payload:', payload);
    message.success('Test created successfully!');
    navigate('/home');
  };

  return (
    <div className="test-creation-container">
      <Card title="Create Test for Job" className="test-creation-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ totalQuestions: 10, difficulty: 'medium' }}
        >
          <Form.Item
            label="Test Creation Mode"
            name="testMode"
            rules={[{ required: true, message: 'Please select a mode!' }]}
          >
            <Radio.Group onChange={(e) => setTestMode(e.target.value)} value={testMode}>
              <Radio value="manual">Manual Creation</Radio>
              <Radio value="ai">AI-Generated Test</Radio>
            </Radio.Group>
          </Form.Item>

          {testMode === 'ai' && (
            <>
              <Form.Item
                label="Total Number of Questions"
                name="totalQuestions"
                rules={[{ required: true, message: 'Please specify the total number of questions!' }]}
              >
                <InputNumber
                  min={1}
                  max={100}
                  style={{ width: '100%' }}
                  onChange={handleTotalQuestionsChange}
                />
              </Form.Item>

              {!showQuestionTypes ? (
                <Form.Item label="Do you want to specify question types?">
                  <Radio.Group
                    onChange={(e) => {
                      setShowQuestionTypes(e.target.value === 'yes');
                      if (e.target.value === 'no') {
                        setQuestionTypes([]);
                      }
                    }}
                  >
                    <Radio value="yes">Yes</Radio>
                    <Radio value="no">No</Radio>
                  </Radio.Group>
                </Form.Item>
              ) : (
                <Form.Item label="Question Types">
                  {questionTypes.map((qt, index) => (
                    <Space key={index} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Select
                        placeholder="Select question type"
                        value={qt.type}
                        onChange={(value) => handleQuestionTypeChange(index, 'type', value)}
                        style={{ width: 200 }}
                      >
                        <Option value="theoretical">Theoretical</Option>
                        <Option value="numerical">Numerical</Option>
                        <Option value="practical">Practical</Option>
                        <Option value="conceptual">Conceptual</Option>
                        <Option value="general">General</Option>
                      </Select>
                      <InputNumber
                        min={0}
                        max={totalQuestions}
                        value={qt.count}
                        onChange={(value) => handleQuestionTypeChange(index, 'count', value)}
                        placeholder="Count"
                        disabled={!qt.type} // Disable if type is not selected
                      />
                      <Button danger onClick={() => handleRemoveQuestionType(index)}>
                        Remove
                      </Button>
                    </Space>
                  ))}
                  <Button
                    type="dashed"
                    onClick={handleAddQuestionType}
                    block
                    disabled={questionTypes.length >= 5}
                  >
                    Add Question Type
                  </Button>
                </Form.Item>
              )}

              <Form.Item
                label="Difficulty Level"
                name="difficulty"
                rules={[{ required: true, message: 'Please select a difficulty level!' }]}
              >
                <Select style={{ width: '100%' }}>
                  <Option value="easy">Easy</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="hard">Hard</Option>
                </Select>
              </Form.Item>
            </>
          )}

          {testMode === 'manual' && (
            <div>
              <h3>Manual Questions</h3>
              {manualQuestions.length === 0 ? (
                <p>No questions added yet.</p>
              ) : (
                <ul>
                  {manualQuestions.map((q, index) => (
                    <li key={index} style={{ marginBottom: 10 }}>
                      <strong>{q.type.toUpperCase()}:</strong> {q.text}
                      <Button
                        danger
                        size="small"
                        style={{ marginLeft: 10 }}
                        onClick={() => handleRemoveManualQuestion(index)}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              <Button type="primary" onClick={handleAddManualQuestion} style={{ marginBottom: 20 }}>
                Add Question
              </Button>
            </div>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              disabled={testMode === 'manual' && manualQuestions.length === 0}
            >
              {testMode === 'manual' ? 'Save Manual Test' : 'Generate Test'}
            </Button>
          </Form.Item>
        </Form>

        {/* Modal for adding manual questions */}
        <Modal
          title="Add Manual Question"
          visible={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
        >
          <Form layout="vertical">
            <Form.Item label="Question Type">
              <Select
                value={currentQuestion.type}
                onChange={(value) => setCurrentQuestion({ ...currentQuestion, type: value })}
              >
                <Option value="theoretical">Theoretical</Option>
                <Option value="numerical">Numerical</Option>
                <Option value="practical">Practical</Option>
                <Option value="conceptual">Conceptual</Option>
                <Option value="general">General</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Question Text">
              <TextArea
                rows={4}
                value={currentQuestion.text}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                placeholder="Enter the question text"
              />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default TestCreationPage;