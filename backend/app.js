const express = require("express");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const app = express();
app.use(express.json());
const path = require("path");
app.use(express.static(path.join(__dirname, "../client/build")));
let forms = {}; 

app.use(cors());

app.use(express.json());

app.post("/save-form", (req, res) => {
  const formId = uuidv4();
  forms[formId] = req.body.fields;
  res.json({ formId });
});

app.get("/getformdata/:formId", (req, res) => {
  console.log("all fomrs:", forms);
  const formId = req.params.formId;
  if (forms[formId]) {
    res.json({ fields: forms[formId] });
  } else {
    res.status(404).json({ message: "Form not found" });
  }
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
