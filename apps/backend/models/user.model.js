import mongoose,{Schema} from "mongoose";
const userSchema=new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        minlength:2,
        maxlength:20
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address.']
    },
    password:{
        type:String,
        required:true,
        minlength:6,
        maxlength:60
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }
}, {
    timestamps:true
});
export const User=mongoose.model("User",userSchema);
