import { asyncHandeler } from "../utils/asyncHandeler.js"
import {ApiError} from "../utils/apiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"


const registerUser = asyncHandeler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res



    const {fullName, email, username, password} = req.body
    if (
        [fullName,email,username,password].some((field)=>
            field?.trim()==="")
    ) {
        throw new ApiError(400, "all fields are required")
    }

    const existedUser = await User.findOne({
        $or:[{ username },{ email }]
    })

    if(existedUser){
        throw new ApiError(409,"user with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.file.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) {
        throw new ApiError(500,"something went while registering the user" )
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registered successfully")
    )


} )

const loginUser = asyncHandeler(async(req,res) => {
    // req->body data
    // username or email
    // find the user
    // password check
    // access and refresh tokens
    // send cookie

    const {email,username,password} = req.body
    if(!username || !email){
        throw new ApiError(400,"username or email is required")
    }

    const user = await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new ApiError(404, "user does not exist")
    }
})


export {
    registerUser,
}