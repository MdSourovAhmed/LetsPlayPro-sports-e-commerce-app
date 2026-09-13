// const User = require('../models/User');

// // ✅ GET /api/user/profile  → Fetch logged-in user profile
// exports.getProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).select('-password');
//     if (!user) return res.status(404).json({ message: 'User not found' });
//     res.json(user);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error fetching profile' });
//   }
// };

// // ✅ PUT /api/user/profile  → Update user profile
// exports.updateProfile = async (req, res) => {
//   try {
//     const updates = {
//       name: req.body.name||"",
//       email: req.body.email||"",
//       phone: req.body.phone||"",
//       address: req.body.address||"",
//       profileImage: req.body.profileImage||"", // base64 or Cloudinary URL
//     };

//     const user = await User.findByIdAndUpdate(req.user._id, updates, {
//       new: true,
//     }).select('-password');

//     if (!user) return res.status(404).json({ message: 'User not found' });
//     res.json({ message: 'Profile updated successfully', user });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error updating profile' });
//   }
// };

const User = require("../models/User");
// const cloudinary = require("cloudinary").v2;

const cloudinary = require("../config/cloudinary");


// ✅ GET /api/user/profile → Fetch logged-in user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

// ✅ PUT /api/user/profile → Update user profile
exports.updateProfile = async (req, res) => {
  console.log("updating profile----");
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    let userImage = user.profileImage;
    let profileImageUrl = req.body.profileImage;

    if (profileImageUrl ) {
      // Optional: delete old images if new ones provided
      const publicId = userImage.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`user_profiles/${publicId}`);
    }

    // If profileImage is a base64 string, upload to Cloudinary
    if (profileImageUrl && profileImageUrl.startsWith("data:image")) {
      const uploadResponse = await cloudinary.uploader.upload(profileImageUrl, {
        folder: "user_profiles", // optional folder
        width: 500,
        height: 500,
        crop: "fill",
      });
      profileImageUrl = uploadResponse.secure_url;
    }

    const updates = {
      name: req.body.name || "",
      email: req.body.email || "",
      phone: req.body.phone || "",
      address: req.body.address || "",
      profileImage: profileImageUrl || "",
    };

    const userUpdated = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    }).select("-password");

    if (!userUpdated)
      return res.status(404).json({ message: "User not found" });
    res.json({ message: "Profile updated successfully", userUpdated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating profile" });
  }
};
