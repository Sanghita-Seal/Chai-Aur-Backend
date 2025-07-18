import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const healthcheck = asyncHandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
    res.status(200).json(new ApiResponse("OK", "Service is healthy").toJSON())
    // If you want to throw an error for testing purposes, uncomment the line below
    throw new ApiError(500, "Simulated error for testing purposes")      

    
})

export {
    healthcheck
    }