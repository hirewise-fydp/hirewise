import React, { useState } from "react";
import axios from "axios";

function CandidatePage() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post("http://localhost:5000/api/v4/hr/process-jd", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setText(response.data.text);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div>
      <h1>OCR Application</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" name="image" onChange={handleFileChange} />
        <button type="submit">Upload and Extract Text</button>
      </form>
      {text && <p>Extracted Text: {text}</p>}
    </div>
  );
}

export default CandidatePage;
