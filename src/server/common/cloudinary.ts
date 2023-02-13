import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
	cloud_name: "killcamgg",
	api_key: "493393293574678",
	api_secret: "jeNS5vNIoPjJJxhcN97Iywqzvko"
});

export const uploadImage = async (image: string) => {

	// Upload
	const url = await cloudinary.uploader.upload(image, {
		width: 300,
		height: 300,
		format: "webp",
		allowed_formats: ["jpg", "png", "webp"],
	}).then((data) => {
		return data.secure_url
	}).catch((err) => {
		console.log(err);
		return null;
	});

	return (url);
}