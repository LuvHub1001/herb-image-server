import express from "express";
import multer from "multer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import s3 from "../s3";
import { detectImageType } from "../imageType";

const router = express.Router();

const DECLARED_MIME_ALLOWLIST = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fieldNestingDepth: 1,
    fileSize: 10 * 1024 * 1024,
    files: 1,
    fields: 10,
  },
  // 선언된 Content-Type은 위조 가능하므로 조기 거절
  // 실제 검증은 핸들러의 detectImageType(버퍼 시그니처)이 담당
  fileFilter: (_req, file, cb) => {
    if (!DECLARED_MIME_ALLOWLIST.includes(file.mimetype)) {
      return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
    }
    cb(null, true);
  },
});

router.post("/", upload.single("image"), async (req, res): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "파일 없음" });
    }

    const detected = detectImageType(req.file.buffer);
    if (!detected) {
      return res.status(415).json({ message: "지원하지 않는 이미지 형식" });
    }

    const bucket = process.env.AWS_S3_BUCKET_NAME!;
    const key = `uploads/${randomUUID()}${detected.extension}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: req.file.buffer,
        ContentType: detected.mime,
      })
    );

    const region = process.env.AWS_REGION;
    const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    return res.status(200).json({ url });
  } catch (err) {
    console.error("[upload] S3 업로드 실패:", err);
    return res.status(500).json({ message: "서버 에러" });
  }
});

router.use((err: any, _req: any, res: any, next: any): any => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: "파일이 너무 큼 (최대 10MB)" });
    }
    return res.status(400).json({ message: "잘못된 업로드 요청" });
  }
  return next(err);
});

export default router;
