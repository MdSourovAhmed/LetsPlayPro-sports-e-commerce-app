const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

exports.signup = async (req, res) => {
  console.log(" signup req received...");
  try {
    const { name, email, password, role } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });
    const user = new User({ name, email, password, role });
    await user.save();
    const token = signToken(user);
    res.json({
      success: true,
      token,
      user: user,
      // user: {
      //   id: user._id,
      //   email: user.email,
      //   name: user.name,
      //   role: user.role,
      // },
    });
  } catch (err) {
    res.status(500).json({ message: "Signup failed" });
  }
};

exports.login = async (req, res) => {
  console.log("Login request received...");
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });
    const token = signToken(user);
    res.json({
      success: true,
      token,
      user: user,
      // user: {
      //   id: user._id,
      //   email: user.email,
      //   name: user.name,
      //   role: user.role,
      // },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};
