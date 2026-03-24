import express from "express";
import multer from "multer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import s3 from "../s3";
import path from "path";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("image"), async (req, res): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "파일 없음" });
    }

    const bucket = process.env.AWS_S3_BUCKET_NAME!;
    const extension = path.extname(req.file.originalname);
    const key = `uploads/${randomUUID()}${extension}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      })
    );

    const region = process.env.AWS_REGION;
    const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    return res.status(200).json({ url });
  } catch (err) {
    return res.status(500).json({ message: "서버 에러", error: err });
  }
});

export default router;
