require("dotenv").config();

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: "dfpkzqxnh",
  api_key: "349752754959432",
  api_secret: "_wevVau5SEYdLkpUSZd6bLDwExo",
});
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "curiosity",
    allowedFormats: ["jpg", "png", "jpeg"],
  },
});

module.exports = { storage, cloudinary };
