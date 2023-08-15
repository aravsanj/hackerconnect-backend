import { NextFunction, Request, Response } from "express";
import AWS from "aws-sdk";
import {
  AWS_ACCESS_KEY,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
} from "../config/aws.js";

AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});

const s3 = new AWS.S3();

const uploadProfilesToS3 = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { file } = req;
  const { _id } = req.body;

  if (!file) {
    return res.status(400).json({ error: "No file provided" });
  }

  const params = {
    Bucket: "hackerconnect-images",
    Key: `uploads/profiles/${_id}_${Date.now()}_${file.originalname}`,
    Body: file.buffer,
    ACL: "public-read",
  };

  s3.upload(params, (err: any, data: any) => {
    if (err) {
      console.error("Error uploading to S3:", err);
      return res.status(500).json({ error: "Error uploading to S3" });
    }

    // @ts-ignore
    req.s3Url = data.Location;
    next();
  });
};

const uploadCoversToS3 = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { file } = req;
  const { _id } = req.body;

  if (!file) {
    return res.status(400).json({ error: "No file provided" });
  }

  const params = {
    Bucket: "hackerconnect-images",
    Key: `uploads/covers/${_id}_${Date.now()}_${file.originalname}`,
    Body: file.buffer,
    ACL: "public-read",
  };

  s3.upload(params, (err: any, data: any) => {
    if (err) {
      console.error("Error uploading to S3:", err);
      return res.status(500).json({ error: "Error uploading to S3" });
    }

    // @ts-ignore
    req.s3Url = data.Location;
    next();
  });
};


export { uploadProfilesToS3, uploadCoversToS3 };