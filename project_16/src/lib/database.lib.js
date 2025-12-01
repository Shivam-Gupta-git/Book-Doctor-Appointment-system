import mongoose from "mongoose";

export const dataBase = async () => {
  try {
    // Check if already connected
    if(mongoose.connection.readyState >= 1){
      return;
    }
    
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not set");
    }
    
    await mongoose.connect(`${process.env.MONGODB_URI}/nextProject`);
    console.log("mongodb connection successful");
  } catch (error) {
    console.error("mongodb connection failed", error);
    // Re-throw the error so it can be caught by the calling function
    throw error;
  }
}