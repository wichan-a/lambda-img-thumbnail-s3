# lambda-img-thumbnail-s3

## Introduction

This package was created to automatically generate thumbnails from s3 image uploads.

## Getting Started

Install this package using the following the command then require the package in your code.

```sh
npm install lambda-img-thumbnail-s3
```

### Using in your own function

You can use [the provided s3example.js](examples/s3.js) to get you started.
Or you can use the following code snippet for a lambda function.

```js
// Require the library
const lmtS3 = require("lambda-img-thumbnail-s3")

// images
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

// use
exports.handler = function(event, context, callback) {
  return lmtS3({ imgSizes, event, context, callback })
}
```
