import express from "express";
import multer from "multer";
import s3 from "../s3";
import { v4 as uuidv4 } from "uuid";
import path from "path";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("image"), async (req, res): Promise<any> => {
  try {
    console.log("📦 파일 도착:", req.file);

    if (!req.file) {
      return res.status(400).json({ message: "파일 없음" });
    }

    const extension = path.extname(req.file.originalname);
    const key = `uploads/${uuidv4()}${extension}`;

    const result = await s3
      .upload({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      })
      .promise();

    console.log("✅ 업로드 성공:", result.Location);

    return res.status(200).json({ url: result.Location });
  } catch (err) {
    console.error("❌ 업로드 중 에러:", err);
    return res.status(500).json({ message: "서버 에러", error: err });
  }
});

export default router;
