import mongoose from "mongoose";
const Schema = mongoose.Schema;

const formSchema = new Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobDescription', required: true },
    formData: [
        {
            label: { type: String, required: true },
            type: { type: String, enum: ['text', 'number', 'email', 'date', 'textarea', 'select'], required: true },
            options: { type: [String], default: [] },
            required: { type: Boolean, default: true }
        }
    ]
}, { timestamps: true });

export const Form = mongoose.model('Form', formSchema);
