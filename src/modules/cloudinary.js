var cloudinary = require('cloudinary');
var initialized = false;

function init() {
	if (initialized) return;
	cloudinary.config({
		cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
		api_key: process.env.CLOUDINARY_API_KEY,
		api_secret: process.env.CLOUDINARY_API_SECRET
	});
	initialized = true;
}

export function getUrl(public_id, options = {}){
	init()
	return cloudinary.url(public_id, options ) 
}

export function uploadFromPath(filePath, options = {}) {
	return new Promise((resolve, reject) => {
		init();
		cloudinary.v2.uploader.upload(filePath, options, function(err, res) {
			if (err) {
				reject(err)
			} else {
				resolve(res)
			}
		});
	});
}

export default {
	uploadFromPath
}