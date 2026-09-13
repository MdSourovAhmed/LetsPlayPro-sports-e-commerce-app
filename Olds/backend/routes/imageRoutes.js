const express = require("express");
const {
  getAllImages,
  getImages,
  uploadImage,
  deleteImage,
} = require("../controllers/imageController");
const authenticateToken = require("../middleware/auth"); // Assume you add this

const router = express.Router();

// router.get("/", getImages);
// router.get("/images", getAllImages);
// router.post("/", authenticateToken, uploadImage);

// router.delete("/:id", authenticateToken, deleteImage);

module.exports = router;
