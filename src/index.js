//As early as possible in your application, import and configure dotenv:
//require('dotenv').config({path:'./env'})
import dotenv from "dotenv";
dotenv.config({
    path:'./.env'
    //path:'./env' without the . before env
    //  it will throw mongoDB parser error
})
//better approach: take a separate file , write all code there and 
// just import that in the index file

import connectDB from "./db/index.js";

/*in package.json
"scripts": {
    "dev": "nodemon -r dotenv/config --experimental-json-module src/index.js"
  },*/
connectDB()











/* another but polluted approach where the entire code is inside the index.js file
import mongoose from "mongoose"
import { DB_NAME } from "./constants";
import express from "express"
const app=express()
//(()=>{})() 

;(async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("Error: ", error);
            throw error
            
        })
        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port " ${process.env.PORT}`);
            
        })
    }catch(error){
        console.error(error);
        throw error
    }
})()
    */