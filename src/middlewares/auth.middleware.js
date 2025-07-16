/*
The verifyJWT middleware:
-Checks if the incoming request has a valid access token
-Verifies the token's authenticity.
-Fetches the user from the database using the token's payload.
-Attaches the user to req.user.
-Calls next() to continue the request-response cycle.

✅ Summary of What This Middleware Does:
    Step	        What it Does
🔍 Get token	From cookies or Authorization header
✅ Verify token	With jwt.verify() and secret key
👤 Fetch user	Using decoded _id from DB
❌ Throw error	If token or user is invalid
✅ Attach user	To req.user for later use
👉 Move next	Calls next() if all is valid
*/
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT= asyncHandler(async(req, _, next)=>{
   try {
     const token = req.cookies?.accessToken || req.header
     ("Authorization")?.replace("Bearer ","")
 
     if(!token){
         throw new ApiError(401, "Unauthorized request")
     }
 
     //check if the token is right or wrong
     //import jwt
     const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

     
     //database access request
     const user = await User.findById(decodedToken._id).
     select("-password -refreshToken")
     if(!user){
         //next video
         throw new ApiError(401, "Invalid Access Token")
     }
     req.user=user
     next()

     //router.route("/logout").post(verifyJWT, logoutUser)
     //"next()" lekha hoi to say after
     //  verifyJWT method run  logoutUSer


   } catch (error) {
        throw new ApiError(401, error?.message || 
            "Invalid Access Token")
   }
})