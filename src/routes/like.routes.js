import { Router } from "express";

import {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideo
} from "../controllers/like.controller.js"

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);//Apply verifyJWT middleware to all the routes in this file

router.route("/toggle/v/:videoId").post(toggleVideoLike)
router.route("/toggle/v/:commentId").post(toggleCommentLike)
router.route("/toggle/v/:tweetId").post(toggleTweetLike)
router.route("/videos").post(getLikedVideo)