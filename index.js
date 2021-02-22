const AWS = require("aws-sdk");
const sharp = require("sharp");

const s3 = new AWS.S3();

exports.handler = async (event, context, callback) => {
  const Bucket = event.Records[0].s3.bucket.name;
  const Key = event.Records[0].s3.object.key;
  const filename = Key.split("/")[Key.split("/").length - 1];
  const ext = Key.split(".")[Key.split("/").length - 1];
  const requiredFormat = ext === "jpg" ? "jpeg" : ext;

  console.log('name', filename, 'ext', ext);

  try {
    const s3Object = await s3.getObject({Bucket, Key}).promise();
    console.log('original', s3Object.Body.length);
    const resizedImage = await sharp(s3Object.Body).resize(470).toFormat(requiredFormat).toBuffer();
    await s3.putObject({
      Bucket,
      Key: `thumb/${filename}`,
      Body: resizedImage,
      ContentType: "image"
    }).promise();
    console.log('put', resizedImage.length);
    return callback(null, resizedImage.length);

  } catch (error) {
    console.error(error);
    return callback(error);
  }
}
