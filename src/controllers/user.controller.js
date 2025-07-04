import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
/*
const registerUser= asyncHandler( async (req, res)=>{
    res.status(200).json({
        message: "ok!!"
    })
} )
*/
const registerUser= asyncHandler( async (req, res)=>{
    /* Steps:
    1. Get user details from frontend(or Postman)
    2. Validate that fields are not empty
    3. Check if user already exists using username and email
    4. Check for uploaded images, including avatar
    5. Upload avatar and images to Cloudinary
    6. Create user object and save entry to the database
    7. Remove password and refresh token from the response
    8. Verify that user creation was successful
    9. Return the response
*/

    const {fullName, email,username,  password }= req.body
    console.log("Email: ",email);
    //validation
    if (
        [fullName, email,username,  password].some((field)=>
        field?.trim()==="")
    ) {
        throw new ApiError(400, "All fields are required ")
    }

    //Check if user already exists using username and email
    const existedUser= User.findOne({
        $or: [{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409, "User with user or email already exist")
    }
    //4. Check for uploaded images, including avatar
    const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverImageLocalPath =req.files?.coverImage[0].path;
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    //5. Upload avatar and images to Cloudinary && check avatar again
    const avatar =await uploadOnCloudinary(avatarLocalPath)
    const coverImage =await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
                throw new ApiError(400, "Avatar file is required")

    }
    // 6. Create user object and save entry to the database
    //database-1. database in is diff continent so take time: use await
    //2. may throw error: for that we have asyncHandler.js it will handle i
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        //tocheck if user has given it or not...//
        // if not keep it empty as it's not compulsory
        email,
        password,
        username: username.toLowerCase()
    })
    //7. Remove password and refresh token from the response
    const createdUser= await User.findById(user._id).select(
        "-password -refresh" //ekane jegulo  ke baad 
        // dite chai only segulo likhte hoi
    )
    //8. Verify that user creation was successful
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user ")
    }

    //9. Return the response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User created successfully")
    )
} )




export {registerUser}