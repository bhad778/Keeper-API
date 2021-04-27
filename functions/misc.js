"use strict";
require("dotenv").config({ path: "../variables.env" });

// const FileType = require("file-type");
const { v4: uuid } = require("uuid");
const AWS = require("aws-sdk");

const s3 = new AWS.S3();

const allowedMimes = ["image/jpeg", "image/png", "image/jpg"];

module.exports.imageUpload = async (event) => {
  const body = JSON.parse(event.body);

  try {
    if (!body || !body.image || !body.mime) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "incorrect body on request" }),
      };
    }

    if (!allowedMimes.includes(body.mime)) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "mime is not allowed " }),
      };
    }

    let imageData = body.image;
    // if (body.image.substr(0, 7) === "base64,") {
    //   imageData = body.image.substr(7, body.image.length);
    // }
    // const buffer = Buffer.from(imageData, "base64");

    const decodedFile = Buffer.from(
      imageData.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );

    const name = uuid();
    const key = `${name}.jpeg`;

    console.log(`writing image ${key} to bucket`);

    const uploadResult = await s3
      .upload({
        Body: decodedFile,
        Key: key,
        ContentType: body.mime,
        Bucket: process.env.keeperImageUploadBucket,
        ACL: "public-read",
      })
      .promise();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        imageURL: uploadResult.Location,
      }),
    };
  } catch (error) {
    console.log("error", error);

    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: error.message || "failed to upload image",
      }),
    };
  }
};
