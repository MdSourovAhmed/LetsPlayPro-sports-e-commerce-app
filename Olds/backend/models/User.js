// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
// });

// module.exports = mongoose.model('User', userSchema);

// const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String },
//     email: { type: String, required: true, unique: true, lowercase: true },
//     password: { type: String, required: true },
//     role: { type: String, enum: ["user", "admin"], default: "user" },
//   },
//   { timestamps: true }
// );

// // Hash password before save
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// // Compare password helper
// userSchema.methods.comparePassword = async function (candidate) {
//   return await bcrypt.compare(candidate, this.password);
// };

// module.exports = mongoose.model("User", userSchema);







// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');

// const userSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   name: { type: String, required: true },
//   role: { type: String, enum: ['user', 'admin'], default: 'user' },
//   resetPasswordToken: String,
//   resetPasswordExpiry: Date
// }, { timestamps: true });

// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// userSchema.methods.comparePassword = async function(password) {
//   return bcrypt.compare(password, this.password);
// };

// module.exports = mongoose.model('User', userSchema);




const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },

    // 🆕 Additional profile fields
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    profileImage: { type: String, default: '' }, // base64 or Cloudinary URL

    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    resetPasswordToken: String,
    resetPasswordExpiry: Date,
  },
  { timestamps: true }
);

// 🔐 Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔍 Compare password
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
