
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app=express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
    //many more options are there
}))

//configuration or setting middleware for 
//limiting what type of data may come

app.use(express.json({limit: "16kb"}))//for json data limit
app.use(express.urlencoded({extended: true, limit:"16kb"}))//for url data
app.use(express.static("public"))//for making a static folder that don't change
app.use(cookieParser())//for using line no. 3


//routes import
import userRouter from "./routes/user.routes.js"

//routes declaration
app.use("/api/v1/users", userRouter) //standard practice
//app.use("/users", userRouter) easy one

//http://localhost:8000/api/v1/users/register


export {app}