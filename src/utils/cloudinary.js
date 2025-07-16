import { v2 as cloudinary } from 'cloudinary';
import fs from "fs" // node filesystem search and read documentation
// console.log("🧪 Checking Cloudinary env vars:");
// console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
// console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY);
// console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "Loaded ✅" : "Missing ❌");

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
    // file upload often gives error so use try-catch block
    try {
        if (!localFilePath) return null;

        // ✅ CHANGED: Logging the file path being uploaded
        //console.log("📤 Uploading file from:", localFilePath);

        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        // file has been uploaded successfully
        //console.log("✅ File is uploaded on cloudinary:", response.url);
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        // ✅ CHANGED: Log the actual error for better debugging
        console.error("❌ Cloudinary Upload Failed:", error.message);

        // ✅ CHANGED: Wrapped fs.unlinkSync in try-catch to avoid crashes if file doesn't exist
        try {
            fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
        } catch (cleanupError) {
            console.warn("⚠️ Failed to delete local file:", cleanupError.message);
        }

        return null;
    }
}

export { uploadOnCloudinary };
