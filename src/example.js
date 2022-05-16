import lambdaImgThumbnailToS3 from './lambdaImgThumbnailToS3'

// constants
const imgSizes = [
  { event: 'original', suffix: '_o', quality: 60 },
  { event: 'resize', suffix: '_l', quality: 60, maxWidth: 1024 },
  { event: 'resize', suffix: '_m', quality: 60, maxWidth: 500 },
  { event: 'resize', suffix: '_s', quality: 60, maxWidth: 240 },
  { event: 'resize', suffix: '_t', quality: 60, maxWidth: 100 },
  { event: 'crop', suffix: '_q', quality: 60, maxWidth: 150, cropWidth: 150, cropHeight: 150 },
  
  { event: 'original', suffix: '_o', quality: 80, webp: true },
  { event: 'resize', suffix: '_l', quality: 80, maxWidth: 1024, webp: true },
  { event: 'resize', suffix: '_m', quality: 80, maxWidth: 500, webp: true },
  { event: 'resize', suffix: '_s', quality: 80, maxWidth: 240, webp: true },
  { event: 'resize', suffix: '_t', quality: 80, maxWidth: 100, webp: true },
  { event: 'crop', suffix: '_q', quality: 80, maxWidth: 150, cropWidth: 150, cropHeight: 150, webp: true }
]


exports.handler = function(event, context, callback) {
  return lambdaImgThumbnailToS3({ imgSizes, event, context, callback })
}