import mongoose, {Schema} from "mongoose"
//paginate is used as we have to reload as
//  it's not possible to keep all comments in one page
import mongooseAggregatePaginate from 
"mongoose-aggregate-paginate-v2"

const commentSchema= new Schema ({
    content:{
        type: String,
        required: true
    },
    video:{
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps: true})

commentSchema.plugin(mongooseAggregatePaginate)


export const Comment = mongoose.model("Comment", commentSchema)