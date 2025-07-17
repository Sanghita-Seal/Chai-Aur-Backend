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
            filter.videoOwner = videoOwner
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
        const videoFile = req.files?.video?.[0]
        const thumbnailFile = req.files?.thumbnail?.[0]
    
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
            new ApiResponse(201, "Video published Successfully")
        );
    } catch (error) {
        new ApiResponse(
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
        return res.status(203).json(
            new ApiResponse(203, video, "Video fetched successfully")
        )
      
} catch (error) {
    new ApiResponse(
        error.statusCode || 502,
        null,
        error.message || " Unprecedented error in getVideoById"
    )
}
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

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