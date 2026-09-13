const Image = require("../models/Image");
const dotenv = require("dotenv");
dotenv.config();
const cloudinary = require("../config/cloudinary");

// await cloudinary();

// Get images (with optional tag filter)
const getImages = async (req, res) => {
  const { tag } = req.query;
  try {
    const images = await Image.find(tag ? { tag } : {});
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch images" });
  }
};

const getAllImages = async (req, res) => {
  try {
    const images = await Image.find({});
    res.json(images);
    console.log(images);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch images" });
  }
};

// Upload image to Cloudinary and save in DB
const uploadImage = async (req, res) => {
  try {
    const file = req.body.file; // Expecting base64 or file path
    const opts = {
      overwrite: true,
      invalidate: true,
      resource_type: "auto",
    };

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file, opts);

    if (!result.secure_url) {
      return res.status(400).json({ message: "Image upload failed" });
    }

    // Save image metadata to MongoDB
    const image = new Image({
      title: req.body.title,
      description: req.body.description,
      url: result.secure_url,
      tag: req.body.tag,
    });

    await image.save();

    res.status(201).json(image);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to upload image" });
  }
};

// Delete image by ID
const deleteImage = async (req, res) => {
  try {
    const image = await Image.findByIdAndDelete(req.params.id);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }
    res.json({ message: "Image deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};

module.exports = {getAllImages, getImages, uploadImage, deleteImage };
