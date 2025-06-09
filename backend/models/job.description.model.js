import mongoose from "mongoose";
const Schema = mongoose.Schema;

const jobDescriptionSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    activeDuration: { startDate: { type: String }, endDate: { type: String } },
    jobType: {
      type: String,
      required: true,
    },

    employmentType: {
      type: String,
      required: true,
    },
    jobSummary: {
      type: String,
      // required: true
    },
    file: {
      url: String,
      publicId: String,
      format: String,
    },
    keyResponsibilities: {
      type: [String],
      // required: true
    },
    qualifications: {
      education: {
        type: String,
        // required: true
      },
      experience: {
        type: String,
        // required: true
      },
      skills: {
        type: [String],
        // required: true
      },
    },
    location: {
      type: String,
      // required: true
    },
    compensation: {
      salaryRange: {
        type: String,
        required: false,
        default: "",
      },
      benefits: {
        type: [String],
        required: false,
      },
    },
    applicationProcess: {
      type: String,
      // required: true
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "retrying"],
      default: "pending",
    },
    modules: {
      cvScreening: {
        type: Boolean,
        default: false,
      },
      automatedTesting: {
        type: Boolean,
        default: false,
      },
    },
    isActive: {
      type: Boolean,
      default: true
    },
    jobExpired:{
      type: Boolean,
      default : false

    },
    testCreated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
jobDescriptionSchema.index({ jobType: 1 });
jobDescriptionSchema.index({ employmentType: 1 });
jobDescriptionSchema.pre('save', function (next) {
  if (this.activeDuration?.endDate) {
    const currentDate = new Date();
    this.isActive = this.activeDuration.endDate >= currentDate;
  }
  next();
});
jobDescriptionSchema.pre("remove", async function (next) {
  if (this.file?.publicId) {
    const { deleteFromCloudinary } = await import(
      "../utils/cloudinary.utils.js"
    );
    await deleteFromCloudinary(this.file.publicId);
  }
  next();
});
export const JobDescription = mongoose.model(
  "JobDescription",
  jobDescriptionSchema
);
