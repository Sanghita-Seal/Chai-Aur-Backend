import { Router } from "express";
import { changeCurrentPassword, 
    getCurrentUser, 
    getUserChannelProfile, 
    getWatchHistory, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    registerUser, 
    updateAccountDetails, 
    updateUserAvatar, 
    updateUserCoverImage 
} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verify } from "jsonwebtoken";

const router= Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",//Ei name ta frontend eo same hoya dorkar
            maxCount:1
        },
        {
            name: "coverImage",//Ei name ta frontend eo same hoya dorkar
            maxCount:1
        }
    ]),
    registerUser

)

router.route("/login").post(loginUser)
//router.route("/login").post(login)



//secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,
    changeCurrentPassword)
router.route("/current-user").get(verifyJWT,
    getCurrentUser
)
//patch is v.imp to remember
//  otherwise all deails will be updated
router.route("/update-account").patch(verifyJWT,
    updateAccountDetails
)

router.route("/avatar").patch(verifyJWT, //middleware
    upload.single("avatar"),//middleware
    updateUserAvatar
)

router.route("/cover-image").patch(verifyJWT, 
    upload.single("coverImage"),//multer
    updateUserCoverImage
    )
//as the below on is taken from params so..
router.route("/c/:username").get(verifyJWT,
    getUserChannelProfile
)

router.route("/history").get(verifyJWT,
    getWatchHistory
)
export default router
 