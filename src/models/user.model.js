import mongoose, {schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema= new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true, 
            lowercase: true,
            trim: true,
            index:true// in mongoDB if you want to make any 
            // field searchable make its index true
        },
        email: {
            type: String,
            required: true,
            unique: true, 
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index:true
        },
        avatar: {
            type: String,//cloudinary url
            required: true,
        },
        coverImage:{
            type:String,//cloudinary url
        },
        watchHistory:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref:"Video",
            }
        ],
        password:{
            type:String,
            required: [true, "Password is required"]
        },
        refreshToken:{
            type:String
        }
    },
    {
        timestamps: true
    }
)
 
userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    //The above line will ensure that only the password
    //will be encrypted and saved when that is modified
    //not for the modification of any other fields

    this.password = bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect= 
async function(password){
    return await bcrypt.compare(password,this.password)
}



userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userSchema)