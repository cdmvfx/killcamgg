export default function getBase64(
	file: File,
	callback: (result: string | ArrayBuffer | null) => void
) {
	const reader = new FileReader();
	reader.readAsDataURL(file);
	reader.onload = function () {
		callback(reader.result);
	};
	reader.onerror = function (error) {
		console.log("Failed to encode file", error);
		callback(null);
	};
}