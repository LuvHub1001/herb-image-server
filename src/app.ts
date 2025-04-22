import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import uploadRouter from "./routes/upload";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/upload", uploadRouter);

app.get("/", (_, res) => {
  res.send("🌿 herb-image-server is alive!");
});

try {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
  });
} catch (error) {
  console.error("Server failed to start:", error);
}
