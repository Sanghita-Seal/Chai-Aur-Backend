import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"

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
//router.route("/login").post(login)
export default router
 