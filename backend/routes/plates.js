const express = require("express");
const axios = require("axios");
const FormData = require("form-data");
const dotenv = require("dotenv").config();
const multer = require("multer");
const router = express.Router();
const upload = multer();
const sharp = require("sharp");

async function drawBox(imageFile, box) {
	const image = sharp(imageFile.buffer);
	const metadata = await image.metadata();
	const x = box.xmin;
	const y = box.ymin;
	const width = box.xmax - box.xmin;
	const height = box.ymax - box.ymin;

	const overlayImage = Buffer.from(
		`<svg>
        <rect x="0" y="0" width="${width}" 
        height="${height}" style="fill:none;
        stroke:green;stroke-width:20" 
        /></svg>`,
	);

	const overlaySharp = sharp(overlayImage, {
		density: metadata.density,
	});

	image.composite([
		{
			input: await overlaySharp.toBuffer(),
			left: x,
			top: y,
		},
	]);

	const result = await image.toBuffer();

	return result;
}

router.post(
	"/",
	upload.single("file"),
	async (req, res) => {
		const url =
			"https://api.platerecognizer.com/v1/plate-reader/";
		const imageFile = req.file;
		const base64Image =
			imageFile.buffer.toString("base64");
		const formData = new FormData();
		formData.append("upload", base64Image);

		const { data } = await axios.post(
			url,
			formData,
			{
				headers: {
					Authorization: `Token ${process.env.LICENSE_PLATES_TOKEN}`,
					...formData.getHeaders(),
				},
			},
		);

		const boxes = data.results.map(
			(item) => item.box,
		);
		let modifiedImage = imageFile;
		for (const box of boxes) {
			modifiedImage = await drawBox(
				modifiedImage,
				box,
			);
		}

		const base64EncodedImage = `data:image/jpeg;base64,${modifiedImage.toString(
			"base64",
		)}`;

		res.json({
			image: base64EncodedImage,
			results: data.results.reverse(),
		});
	},
);

module.exports = router;
