import async from 'async'
import AWS from 'aws-sdk'
import gm from 'gm'
import util from 'util'

const gm = require('gm').subClass({ imageMagick: true })
const s3 = new AWS.S3() // get reference to S3 client


const handler = function ({ imgSizes, dstBucket, event, context, callback }) {
  // Read options from the event.
  console.log("Reading options from event:\n", util.inspect(event, { depth: 5 }))

  // bucket file original
  const srcBucket = event.Records[0].s3.bucket.name
  const srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "))

  // Sanity check: validate that source and destination are different buckets.
  if (srcBucket == dstBucket) {
    callback("Source and destination buckets are the same.")
    return
  }

  // Infer the image type.
  const typeMatch = srcKey.match(/\.([^.]*)$/)

  if (!typeMatch) {
    callback("Could not determine the image type.")
    return
  }

  const imageType = typeMatch[1]

  console.log('image type: ' + imageType)

  if (imageType != "jpg" && imageType != "JPG" && imageType != "png" && imageType != "PNG") {
    callback(`Unsupported image type: ${imageType}`)
    return
  }

  // bucket to resize
  const fullName = srcKey.substring(srcKey.lastIndexOf('/') + 1)
  const dstDir = srcKey.replace(fullName, "")

  let fileName = fullName.replace('.' + imageType, "")
  fileName = fileName.replace("_o", "")


  // Download file from s3
  s3.getObject({ Bucket: srcBucket, Key: srcKey }, function (err, response) {
    if (err) return console.error('unable to download image ' + err)

    const contentType = response.ContentType
    const original = gm(response.Body)

    original.size(function (err, size) {
      if (err) {
        console.log('------------- ERROR --------------')
        return console.error(err)
      }

      async.each(imgSizes, function (imgSize, callback) {
        resizePhoto(size, imgSize, imageType, original, fileName, dstDir, dstBucket, contentType, callback)

      }, function (err) {
        if (err) console.error('Unable to resize ' + srcBucket + ' due to an error: ' + err)
        else console.log('Successfully resized ' + srcBucket)

        context.done()
      })
    })
  })
}


const resizePhoto = function (size, imgSize, imageType, original, fileName, dstDir, dstBucket, contentType, done) {

  if (imgSize.webp) {
    imageType = 'webp'
  }

  const dstKey = dstDir + fileName + imgSize.suffix + "." + imageType;


  // transform, and upload to a different S3 bucket.
  async.waterfall([
    function transform(next) {
      if (imgSize.event === 'resize') {

        const maxWidth = imgSize.maxWidth
        const scalingFactor = Math.min(maxWidth / size.width, maxWidth / size.height)
        const width = scalingFactor * size.width
        const height = scalingFactor * size.height

        // Transform the image buffer in memory.
        original
          .resize(width, height)
          .quality(imgSize.quality)
          .toBuffer(imageType, function (err, buffer) {
            if (err) {
              console.log('resize error' + err)
              next(err)
            } else {
              next(null, buffer)
            }
          })

      } else if (imgSize.event === 'original') {

        original
          .quality(imgSize.quality)
          .toBuffer(imageType, function (err, buffer) {
            if (err) {
              console.log('resize error' + err)
              next(err);
            } else {
              next(null, buffer);
            }
          })


      } else if (imgSize.event === 'crop') {

        const cropWidth = imgSize.cropWidth
        const cropHeight = imgSize.cropHeight

        original
          .resize(cropWidth, cropHeight, '^')
          .gravity('Center')
          .crop(cropWidth, cropHeight)
          .quality(imgSize.quality)
          .toBuffer(imageType, function (err, buffer) {
            if (err) {
              console.log('crop error' + err)
              next(err)
            } else {
              next(null, buffer)
            }
          })
      }
    },

    function upload(data, next) {
      // Stream the transformed image to a different S3 bucket.
      s3.putObject({
        Bucket: dstBucket,
        Key: dstKey,
        Body: data,
        ContentType: contentType,
        CacheControl: 'public, max-age=2592000',
      }, next)
    }
  ], function (err) {
    console.log('finished resizing ' + dstBucket + '/' + dstKey)
    if (err) console.error(err)
    done(err)
  })
}

export default handler