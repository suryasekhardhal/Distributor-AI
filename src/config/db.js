import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

const connectDB = async()=>{
    try {
        const instance = await mongoose.connect(`${process.env.MONGO_DB_URI}/${DB_NAME}`);
        console.log("Database connected successfully",instance.connection.host);
        
    } catch (error) {
        console.log("mongodb connection error in db.js",error);
        process.exit(1);
    }
}

export default connectDB