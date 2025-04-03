import mongoose from "mongoose";

const formSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobDescription",
      required: true,
    },
    fields: [
      {
        id: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: [
            "text",
            "email",
            "number",
            "textarea",
            "select",
            "checkbox",
            "date",
            "file",
          ],
          required: true,
        },
        label: {
          type: String,
          required: true,
        },
        placeholder: {
          type: String,
          default: "",
        },
        required: {
          type: Boolean,
          default: false,
        },
        editable: {
          type: Boolean,
          default: true,
        },
        accept: {
          type: String, // File type restrictions (e.g., ".pdf,.doc,.docx")
          default: "",
        },
        options: {
          type: [String], // Options for select and checkbox fields
          default: [],
        },
      },
    ],
  },
  { timestamps: true }
);

export const Form = mongoose.model("Form", formSchema);
