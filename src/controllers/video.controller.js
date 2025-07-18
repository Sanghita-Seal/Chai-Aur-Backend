import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    //TODO: get all videos based on query, sort, pagination
    /*
        Steps:
        1. Get query parameters from req.query (search, page, limit, sort)
        2. Apply filtering (search keyword)
        3. Apply sorting (based on views, date, etc.)
        4. Paginate results (skip, limit)
        5. Send paginated response
    */

    const {
         page = 1, 
         limit = 10,
         query="",
         sortBy="createdAt",
         sortType="asc",
         userId 
    } = req.query
    try {
        // 1️⃣ Create a base filter object
        const filter = {};
    
        // 2️⃣ Apply text search on title or description if query is provided
        if (query) {
            filter.$or = [
                { title: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } }
            ];
        }
    
        // 3️⃣ Filter by userId if provide
        if(userId && isValidObjectId(userId)){
            filter.videoOwner = userId
        }
    
        // 4️⃣ Setup sorting
        const sortOptions = {};
        sortOptions[sortBy] = sortType === "asc" ? 1 : -1;
        /*If:sortBy = "createdAt", sortType = "asc"
            Then:sortOptions = {
                createdAt: 1
            }*/
    
        // 5️⃣ Pagination values
        const skip = (parseInt(page)-1)*parseInt(limit)
        const limitValue =parseInt(limit)
    
        // 6️⃣ Get total count for pagination metadata
        const totalVideos = await Video.countDocuments(filter)
    
         // 7️⃣ Fetch videos with filter, sort, and pagination
        const videos = await Video
                                .find(filter)
                                .sort(sortOptions)
                                .skip(skip)
                                .limit(limitValue)
                                .populate("videoOwner", "username email" )// populate limited user info
        
        return res
            .status(200)
            .json(
                 new ApiResponse(200,{
                    totalVideos,
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalVideos/limitValue),
                    videos
                }, "Videos sent successfully")
            )
    } catch (error) {
        throw new ApiError(500, "Failed to fetch Videos")
    }
})

const publishAVideo = asyncHandler(async (req, res) => {
    /*
    1. Extract video data from req.body and uploaded file data from req.files.
    2. Validate inputs (title, description, etc.).
    3. Upload video to Cloudinary using your helper
     uploadOnCloudinary() (for both video and optional thumbnail).
    4. Create a new Video document using your Mongoose model.
    5. Return a response using ApiResponse.
    */
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    try {
        const videoFile = req.files?.videoFile?.[0]
        const thumbnailFile = req.files?.thumbnailFile?.[0]
    
        //1.Validate Input
        if(!title || !description || !videoFile){
            throw new ApiError(400, "Title, Description & videoFile is required!")
        }
    
        //2. Upload video
        const videoUploadResponse= await uploadOnCloudinary(videoFile.path, "video")
        if(!videoUploadResponse?.url){
            throw new ApiError(500, "Video upload failed")
        }
    
        //3.Upload Thumbnail
        const thumbnailUploadResponse= await uploadOnCloudinary(thumbnailFile.path, "video")
        if(!thumbnailUploadResponse?.url){
            throw new ApiError(500, "Thumbnail upload failed")
        }
    
        //4. Upload on DB
        const newVideo = await Video.create({
            title,
            description,
            videoUrl: videoUploadResponse.url,
            thumbnailUrl: thumbnailUploadResponse?.url || "" ,
            owner: req.user._id
        })
    
        return res.status(201).json(
            new ApiResponse(201,newVideo, "Video published Successfully")
        );
    } catch (error) {
        return new ApiResponse(
            error.statusCode || 500,
            null,
            error.message || "Internal server error"
        )
    }

})

const getVideoById = asyncHandler(async (req, res) => {
    /*Steps:
    1. Extract  videoId from req.params
    2. Check if the videoId is exists
    3.Use your Video model to find the video by Id
    4. If not found  throw error
    5.if found throw the video in a success ApiResponse
    */

try {
        //1. Extract  videoId from req.params
        const { videoId } = req.params
    
        //2. Check if the videoId is exists
        if(!videoId){
            throw new ApiError(400, "Video Id does not exist")
        }
    
        //3. Use your Video model to find the video by Id
        const video = await Video.findById(videoId)
        
        // 4. If not found  throw error
        if(!video){
            throw new ApiError(401, "Video not found")
        }
    
        //5.if found throw the video in a success ApiResponse
        return res.status(200).json(
            new ApiResponse(200, video, "Video fetched successfully")
        )
      
} catch (error) {
    return new ApiResponse(
        error.statusCode || 502,
        null,
        error.message || " Unprecedented error in getVideoById"
    )
}
})

const updateVideo = asyncHandler(async (req, res) => {
    //TODO: update video details like title, description, thumbnail
    /* Steps
        1: Get new uploaded video if provided
        2: Fetch existing video from DB
        3: Handle new video upload
                //upload it on cloudinary
                // If upload fails or no url is returned throw error
                // If old video exists on Cloudinary, delete it
                //Store new video details to update
        4: Update metadata if provided
        5: If no update data was provided
        6: Perform the update
    .
    */
    const { videoId } = req.params


     // Step 1: Get new uploaded video if provided
    const newVideoFile = req.files?.videoFile?.[0];


    // Step 2: Fetch existing video from DB
    const existingVideo = await Video.findById(videoId);
    if(!existingVideo) {
        throw new ApiError(404, "Video not found")
    }
    let videoData ={}//will store fields to update
    
    
    // Step 3: Handle new video upload
    if(newVideoFile){
         //upload it on cloudinary
         const uploadedVideo = await uploadOnCloudinary(newVideoFile)
        // If upload fails or no url is returned throw error
        if(!uploadedVideo || !uploadedVideo.url){
            throw new ApiError(405, "Failed to upload on cloudinary")
        }
        // If old video exists on Cloudinary, delete it
        if(existingVideo.videoPublicId){
            await cloudinary.uploader.destroy(existingVideo.videoPublicId, {
                resource_type : "video"
            })
        }
        //Store new video details to update
        videoData.videoUrl = uploadedVideo.url
        videoData.videoPublicId = uploadedVideo.public_id
     }


    // Step 4: Update metadata if provided
        const {title, description}= req.body
        if(title) videoData.title = title
        if(description) videoData.description = description


    // Step 5: If no update data was provided
    if (Object.keys(videoData).length === 0) {
        throw new ApiError(400, "No update data provided");
    }


    // Step 6: Perform the update
        const updatedVideo = await Video.findByIdAndUpdate(
            videoId,
            {$set : videoData},
            {new : true}
        )

        return res.status(200).json(
            new ApiResponse(
                200,
                updatedVideo,
                "Video updated successfully"
            )
        )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}