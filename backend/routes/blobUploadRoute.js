const express = require("express");
const multer = require("multer");
const { put } = require("@vercel/blob");
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// Use memory storage (we don't want to save files locally)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", verifyToken, upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Check if BLOB_READ_WRITE_TOKEN is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({ error: 'File upload service not configured. Please contact administrator.' });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `profile-${req.user.id}-${timestamp}-${file.originalname}`;

    const blob = await put(filename, file.buffer, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    res.json({ url: blob.url }); // return the hosted image URL
  } catch (err) {
    res.status(500).json({ error: "Upload failed: " + err.message });
  }
});

module.exports = router;
