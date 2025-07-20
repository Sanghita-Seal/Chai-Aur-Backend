import mongoose, {Schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema= new Schema({
    videoFile:{
        type:String,//cloudinary url
        required: true
    },
    //videoPublicId field ta na thakle  //video delete korte parbe na
    //video delete korte hole videoPublicId ta thakte hobe
    //required: true hole toggleVideo error throw korbe
    videoPublicId: { type: String, required: false },
    thumbnail:{
        type:String,//cloudinary url
        required: true
    },
    title:{
        type:String,//cloudinary url
        required: true
    },
    description:{
        type:String,//cloudinary url
        required: true
    },
    duration:{
        type:Number,//cloudinary url
        required: true
    },
    views:{
        type:Number,//cloudinary url
        default: 0 
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    videoOwner:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})
videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video",videoSchema)