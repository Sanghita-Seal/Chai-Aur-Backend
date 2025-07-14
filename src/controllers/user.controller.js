import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


/*
const registerUser= asyncHandler( async (req, res)=>{
    res.status(200).json({
        message: "ok!!"
    })
} )
*/

const generateAccessAndRefreshToken= async (userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        // refresh token is an object acc. to user.model.js   
        user.refreshToken = refreshToken   
        user.save({validateBeforeSave: false}) 
        
        return{accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrongwhile generating new access or refresh token")
    }
}
const registerUser= asyncHandler( async (req, res)=>{
    console.log("BODY:", req.body);
  console.log("FILES:", req.files);
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
    const existedUser= await User.findOne({
        $or: [{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409, "User with user or email already exist")
    }
    //4. Check for uploaded images, including avatar
    const avatarLocalPath = req.files?.avatar?.[0]?.path?.replace(/\\/g, "/");
    //const coverImageLocalPath = req.files?.coverImage?.[0]?.path?.replace(/\\/g, "/");

    let coverImageLocalPath;   
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0].path
    } 

    console.log("DEBUG avatarLocalPath:", avatarLocalPath);

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }


    //5. Upload avatar and images to Cloudinary && check avatar again
    const avatar =await uploadOnCloudinary(avatarLocalPath)
    console.log("Cloudinary upload result:", avatar);
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

const loginUser= asyncHandler(async (req, res)=>{
    //req.body -> data
    //username or email for validation
    //find the user
    //password check
    //access and refresh token
    //send cookie
    
    const {email, username, password}=req.body

    if(!username && !password){
        throw new ApiError(400, "Username or email is required")
    }
    //Finding user//await as $or is a method
    //  of database & database is in other continent
    const user= await User.findOne({
        $or: [ {username}, {email}]
    })
    if(!user){
        throw new ApiError(400, "User doesn't exist")
    }

    //Password checking
    const isPasswordValid = await user.isPasswordCorrect(password) 

    if(!isPasswordValid){
        throw new ApiError(401, "Password is incorrect")
    }
    //access and refresh token
    const {accessToken, refreshToken}=await generateAccessAndRefreshToken(user._id)

    //optional step
    const loggedInUser= await  User.findById(user._id)
    .select("-password -refreshToken")

    //cookie
    const options={
        //By default cookie is modifiabl by anyone in frontend
        httpOnly: true,//It is made to be modified only in backend
        secure: true
    }


    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken,
                refreshToken
                
            },
            "User logged in successfully"
        )
    )
})


const logoutUser = asyncHandler(async (req, res) => {
    
    //find user
    //delete cookie
    //remove refreshToken
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );
    //cookie
    const options={
        httpOnly: true,
        secure: true
    }


    return res
    .status(200)
    .clearCookie("accessToken",  options)
    .clearCookie("refreshToken",  options)
    .json(
        new ApiResponse(
            200,
            {  },
            "User logged out successfully"
        )
    )
});

const refreshAccessToken = asyncHandler(async(req, res)=>{
    //How to access refresh token?
    //from cookies
    const incomingRefreshToken= 
    req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unathorised Request")
        
    }

    try {
        const decodedToken=jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401, "Invalid refresh token")
            
        }
        //checking it with the token in generateRefreshToken
        //if not matched
        if(incomingRefreshToken != user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
        //if matched generate new token
        //generate cookies
        const options={
            httpOnly: true,
            secured: true
        }
        const {accessToken, newRefreshToken}=await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("newRefreshToken", newRefreshToken, options)
        .json( new ApiResponse(
            200,
            {accessToken, refreshToken: newRefreshToken},
            "Access token refreshed successfully"
        ))
    } catch (error) {
        throw new ApiError(401, error?.message ||
            "Invalid refresh token"
        )
    }
    
})

const changeCurrentPassword = asyncHandler(async(req, res)=>{
    const {oldPassword, newPassword} = req.body

    //see in auth.middleware.js we have req.user=user
    const user = await User.findById(req.user?._id)
    //isPAsswordCorrect method is available in user.model.js
    const isPasswordCorrect= await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
    }

    //set new Password
    user.newPassword =newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req, res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async(req, res)=>{
    const {fullName, email} = req.body;
    if(!fullName || !email){
        throw new ApiError(400, "All field are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,
                email
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))


})

const updateUserAvatar= asyncHandler(async(req, res)=>{
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){ 
        throw new ApiError(400, "Error while uploading avatar, url didn't come")
    }

    User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar : avatar.url
            }
        },
        {new : true}
    ).select("-password")
//delete old avatar image
    //if you want to delete old avatar image from cloudinary
    //you can do it here by using cloudinary destroy method 

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar uploaded successfully")
    )
})
const updateUserCoverImage= asyncHandler(async(req, res)=>{
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage.url){
        throw new ApiError(400, "Error while uploading Cover Image, url didn't come")
    }

    User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage : coverImage.url
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover Image uploaded successfully")
    )
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    // Check if username is missing or just whitespace
    if (!username?.trim()) {
        throw new ApiError(400, "Username is missing");
    }

    const channel = await User.aggregate([
        // 1️⃣ Match the channel by username
        {
            $match: {
                username: username.toLowerCase(), // Match the username (converted to lowercase)
            },
        },

        // 2️⃣ All users who subscribe **to** this channel
        {
            $lookup: {
                from: "subscriptions",            // In the export of subscription.model.js it was Subscription => subscriptions
                localField: "_id",
                foreignField: "channel",          // ei channel tar name koto gulo document ache...subscriber number
                // THis is no. of subscriber of ChaiAurCode is 666k
                as: "subscribers",
            },
        },

        // 3️⃣ All channels that **this user** is subscribed to
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",       // ei subscriber tar name koto gulo document ache...subscriber kota channel
                // subscribe koreche
                // This is ChaiAurCode has subscribed to 10 channels
                as: "subscribedTo",
            },
        },

        // 4️⃣ Add computed fields
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers",        // $subscribers is now a field
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo",       // $subscribedTo is now a field
                },
                // Jokkhon we open any channel in YT it shows "subscribe"(if not done yet)
                // otherwise shows "subscribed"...code for that
                isSubscribed: {
                    $cond: {
                        // this "if" checks if me(the user) is in the "subscribers" list
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false,
                    },
                },
            },
        },

        // 5️⃣ Project only the fields we want to send back
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
            },
        },
    ]);

    if(!channel?.length){
        throw new ApiError(400, "Channel doesn't exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
});
 

const getWatchHistory = asyncHandler(async(req, res)=>{
    const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from :"videos",//in user.model.js=> export const Video = mongoose.model("Video",videoSchema)
                localField:"watchHistory",
                foreignField: "_id",
                pipeline:[
                    {
                        $lookup: {
                            from: "user",
                            localField: "owner",
                            foreignField: "_id",
                            as:"owner",
                            //we don't need to provide all fields of the user to the user.
                            // .for that we are using a sub-pipeline 
                            //sub-pipeline use na koreo kora jete pare baire pipeline likhe
                            pipeline:[
                                {
                                    $project:{
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                },
                                //all the data from look up is available as a array
                                //frontend have to face little prblm if such array is given for that
                                //this extra pipeline
                                {
                                    $addFields:{
                                        //now in frontend it can be accessible by user dot(.) kore 
                                        owner:{
                                            $first: "$owner"
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watched history fetched successfully"
        )
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserAvatar,
    updateAccountDetails,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}