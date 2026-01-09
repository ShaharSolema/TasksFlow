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
        maxlength:40
    }
}, {
    timestamps:true
});
export const User=mongoose.model("User",userSchema);
