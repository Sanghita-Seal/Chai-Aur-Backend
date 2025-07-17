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
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
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