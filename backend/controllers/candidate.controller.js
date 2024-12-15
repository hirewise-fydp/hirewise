import { Form } from '../models/form.model.js';
// const { ObjectId } = mongoose.Types;
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;

export const getFormData = async (req, res) => {
  const { formId } = req.params;
  const formid=new ObjectId(formId)
  console.log(formid)

  try {
    const form = await Form.findById(formid);
    console.log("form",form)
    res.status(200).json({ fields: form.formData });
  } catch (error) {
    console.error("Error fetching form data:", error);
    res.status(500).json({ message: "Something went wrong while fetching the form data." });
  }
};
