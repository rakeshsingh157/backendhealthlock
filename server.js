const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const patientRoutes = require("./routes/patientRoutes");
const userRoutes = require("./routes/userRoutes");
const fileRoutes = require("./routes/fileRoutes");
const QR = require("./routes/qrRoutes");
const docShareRoutes = require("./routes/docShareRoutes");
const analysisRoutes = require("./routes/analysis");
const chatRoutes = require("./app");
const accessDataRoutes = require("./routes/accessdata");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// MongoDB Connection
const MONGODB_URI="mongodb+srv://kumarpatelrakesh222:v6lQJMbyQLPLklyE@cluster0.clf2y32.mongodb.net/sunhackDB?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI)
  .then(() => console.log("🟢 MongoDB connected successfully"))
  .catch((err) => console.error("🔴 MongoDB connection error:", err));

// Routes
app.use("/api/analysis", analysisRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/users", userRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/qr", QR);
app.use("/api/docShare", docShareRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/accessdata", accessDataRoutes);





// Basic route for testing
app.get("/", (req, res) => {
  res.send(" API is running!");
});

app.get("/test", (req, res)=>{
return res.send("pass")
})

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});