import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

const verifyJWT = asyncHandler(async(req, res, next)=>{
    const token = req.cookies.accessToken
    if(!token){
        throw new ApiError(401,"Authentication required")
    }

    const decodedToken = jwt.verify(token,process.env.JWT_SECRET)

   req.user = decodedToken
   next();
})

export {verifyJWT}