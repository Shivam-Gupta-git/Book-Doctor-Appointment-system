import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "doctor"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get or create the User model
// Check if model exists and if schema needs update
let User;
if (mongoose.models.User) {
  User = mongoose.models.User;
  // Update the enum if needed
  const rolePath = User.schema.path('role');
  if (rolePath && rolePath.enumValues && !rolePath.enumValues.includes('doctor')) {
    // Schema needs update - delete and recreate
    delete mongoose.models.User;
    delete mongoose.modelSchemas.User;
    User = mongoose.model("User", userSchema);
  }
} else {
  User = mongoose.model("User", userSchema);
}

export { User };
