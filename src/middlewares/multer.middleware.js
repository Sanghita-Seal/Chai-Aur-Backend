import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

export const upload = multer({ 
    storage: storage 
})
/**
 * ✅ Summary of What This Middleware Does:
 *
 * | Step                   | What it Does                                                    |
 * |------------------------|------------------------------------------------------------------|
 * 📁 Set destination      | Stores uploaded files in the `./public/temp` directory          |
 * 🏷️ Set filename         | Saves the file using its original name                         |
 * 📤 Handle upload       | Middleware handles multipart/form-data using multer             |
 * 📥 Access file         | Uploaded file is available in `req.file` or `req.files`         |
 * ⚠️ Clean up (optional) | You can delete the file after processing (e.g., upload to cloud) |
 * 🛡️ Use in route       | Use `upload.single("file")` or `upload.array("files")`          |
 */
