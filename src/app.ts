import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import uploadRouter from "./routes/upload";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 업로드 라우터
app.use("/upload", uploadRouter);

app.get("/", (_, res) => {
  res.send("🌿 herb-image-server is alive!");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
