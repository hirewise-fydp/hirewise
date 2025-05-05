"use client"
import { Modal, Button, Empty } from "antd"
import { DownloadOutlined } from "@ant-design/icons"

const CvPreview = ({ visible, url, onClose }) => {
  return (
    <Modal
      title="CV Preview"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <Button key="download" type="primary" icon={<DownloadOutlined />} onClick={() => window.open(url, "_blank")}>
          Download CV
        </Button>,
      ]}
      width={800}
      style={{ top: 20 }}
    >
      {url ? (
        <iframe src={url} style={{ width: "100%", height: "600px", border: "none" }} title="CV Preview" />
      ) : (
        <Empty description="No CV available" />
      )}
    </Modal>
  )
}

export default CvPreview
