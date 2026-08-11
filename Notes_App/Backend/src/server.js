import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import notesRoutes from "./routes/notesRoutes.js";
import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";


//const express = require("express") //requires type as commonjs in package.js

dotenv.config();


const app = express();

const PORT = process.env.PORT || 5001

//Middleware
app.use(cors({
    origin: 'http://localhost:5173' 
}));

app.use(express.json()) //this middleware will parse json bodies

app.use(rateLimiter);

app.use("/api/notes", notesRoutes);

connectDB().then(() =>{

    app.listen(PORT, () => {
    console.log("Server started on port: ", PORT);
});

})



