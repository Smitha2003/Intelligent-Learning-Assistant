import mongoose from "mongoose";

// 1- creating schema
// 2- model based off of that schema

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    content: {
        type: String,
        required: true
    },

    tag: {
        type: String,
        required: false, // make true if you want it mandatory
        trim: true
    },
    folder: {
        type: String,
        default: "Uncategorized",
        trim: true
    }
    
}, 
{ timestamps: true } //mongodb automaticaaly provides createdAt and updatedAt fields

);

const Note = mongoose.model("Note", noteSchema)

export default Note