const AWS = require("aws-sdk");
const sharp = require("sharp");

const s3 = new AWS.S3();

const transforms = [
  { name: "thumb", width: 470 },
  { name: "content", width: 950 },
];

exports.handler = async (event, context, callback) => {
  const Bucket = event.Records[0].s3.bucket.name;
  const Key = event.Records[0].s3.object.key;
  const filename = Key.split("/")[Key.split("/").length - 1];
  const ext = Key.split(".")[Key.split("/").length - 1];
  const requiredFormat = ext === "jpg" ? "jpeg" : ext;

  try {
    const s3Object = await s3.getObject({Bucket, Key}).promise();
    
    await Promise.all(
      transforms.map(async (item) => {
        const resizedImage = await sharp(s3Object.Body).resize({ width: item.width }).toFormat(requiredFormat).toBuffer();
        
        await s3.putObject({
          Bucket,
          Key: `${item.name}/${filename}`,
          Body: resizedImage,
          ContentType: "image"
        }).promise();
        
        return callback(null, resizedImage.length);
      })
    )

  } catch (error) {
    return callback(error);
  }
}
