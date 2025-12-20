export const uploadChatFiles = async (req, res) => {
  try {
    const files = req.files?.files || [];

    const processedFiles = files.map((f) => ({
      originalName: f.originalname,
      mimeType: f.mimetype,
      size: f.size,
      path: f.path, // or cloud URL
      isImage: f.mimetype.startsWith("image/"),
    }));

    res.status(200).json({ files: processedFiles });
  } catch (err) {
    res.status(500).json({ message: "File upload failed" });
  }
};
