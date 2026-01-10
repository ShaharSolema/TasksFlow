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
    },
    taskCategories: [
        {
            name: { type: String, trim: true, maxlength: 40 },
            color: { type: String, trim: true, maxlength: 20 }
        }
    ],
    taskLabels: [
        {
            name: { type: String, trim: true, maxlength: 40 },
            color: { type: String, trim: true, maxlength: 20 }
        }
    ],
    jobCategories: [
        {
            name: { type: String, trim: true, maxlength: 40 },
            color: { type: String, trim: true, maxlength: 20 }
        }
    ],
    jobLabels: [
        {
            name: { type: String, trim: true, maxlength: 40 },
            color: { type: String, trim: true, maxlength: 20 }
        }
    ],
    taskColumns: [
        {
            key: { type: String, trim: true, maxlength: 40 },
            name: { type: String, trim: true, maxlength: 40 },
            color: { type: String, trim: true, maxlength: 20 }
        }
    ],
    jobColumns: [
        {
            key: { type: String, trim: true, maxlength: 40 },
            name: { type: String, trim: true, maxlength: 40 },
            color: { type: String, trim: true, maxlength: 20 }
        }
    ]
}, {
    timestamps:true
});
export const User=mongoose.model("User",userSchema);
