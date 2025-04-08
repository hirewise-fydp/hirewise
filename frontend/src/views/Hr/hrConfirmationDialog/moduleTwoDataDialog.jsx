import React, { useState } from "react";
import { Modal, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';

const ConfirmationModal = () => {
  const [isModalVisible, setIsModalVisible] = useState(true);
  let navigate = useNavigate();
  const { jobId, loading, error } = useSelector((state) => state.job);
  console.log("job id inside the module two work:", jobId)

  // Handler to show the modal
  const showModal = () => {
    setIsModalVisible(true);
  };

  // Handler to hide the modal
  const handleCancel = () => {
    navigate('/home')
    setIsModalVisible(false);
    
  };

  // Handler when the user clicks 'Yes'
  const handleConfirm = () => {
    console.log("User confirmed to provide data for module 2");
    console.log("job ud in  moduetwo dialog:", jobId)
    navigate('/test-data-module-two-form', { state: { jobId: jobId }})
    setIsModalVisible(false);
     // Close the modal after confirmation
  };

  return (
    <div>
      <Modal
        title="Confirm"
        visible={isModalVisible}
        onOk={handleConfirm}
        onCancel={handleCancel}
        okText="Yes"
        cancelText="No"
      >
        <p>Do you want to provide essential data for module 2?</p>
      </Modal>
    </div>
  );
};

export default ConfirmationModal;
