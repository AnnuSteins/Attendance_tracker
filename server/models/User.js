 
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); 
 
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, 
      trim: true,     
    },
    email: {
      type: String,
      required: true,
      unique: true,   
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "teacher"], 
      default: "teacher",         
    },
  },
  {
    timestamps: true, 
  }
);


UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});


UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Export the model so other files can use it
module.exports = mongoose.model("User", UserSchema);
