import React, { useState } from "react";
import axios from "axios";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import logo from "../assets/logo.jpeg";
import "bootstrap/dist/css/bootstrap.min.css";
import Spinner from "react-bootstrap/Spinner";

const server = "http://localhost:8080";

const PlateRecognizerForm = () => {
	const [image, setImage] = useState(null);
	const [loading, setLoading] = useState(false);
	const [imagePreview, setImagePreview] =
		useState(null);
	const [fileName, setFileName] = useState(null);
	const [data, setData] = useState([]);

	const handleImageChange = (event) => {
		const selectedImage = event.target.files[0];
		setImage(selectedImage);
		setFileName(selectedImage.name);

		const reader = new FileReader();
		reader.onload = () => {
			setImagePreview(reader.result);
		};
		reader.readAsDataURL(selectedImage);
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		setLoading(true);

		// Create a new FormData object
		const formData = new FormData();
		formData.append("file", image);
		formData.append("fileName", fileName);

		// Make a POST request to the Express route
		axios
			.post(
				`${server}/api/v1/plate-recognizer`,
				formData,
			)
			.then((response) => {
				console.log(response.data);
				const imageUrl = response.data.image;
				setData(response.data.results);
				setImagePreview(imageUrl);
				setLoading(false);
			})
			.catch((error) => {
				console.log(error);
				setLoading(false);
			});
	};

	return (
		<div style={{ marginTop: "5rem" }}>
			<div className="text-center">
				<img src={logo} width="140" alt="logo" />
			</div>
			<br />
			<Form
				onSubmit={handleSubmit}
				style={{
					width: "50%",
					margin: "auto",
					textAlign: "center",
				}}
			>
				<Form.Group controlId="formFile">
					<Form.Label>Upload an image</Form.Label>
					<Form.Control
						type="file"
						onChange={handleImageChange}
					/>
				</Form.Group>
				<br />
				{imagePreview && (
					<div>
						<img
							className="styledImg"
							src={imagePreview}
							alt="Preview"
						/>
						<br />
						<br />
					</div>
				)}
				{data && data.length > 0 && (
					<div
						style={{
							textAlign: "center",
							display: "inline-flex",
							justifyContent: "space-evenly",
							alignItems: "center",
							width: "90%",
							marginBottom: "25px",
						}}
					>
						{data.map((item, index) => (
							<div
								key={index}
								style={{
									textAlign: "center",
									display: "inline-grid",
								}}
							>
								<img
									src={`https://flagsapi.com/${item.region.code.toUpperCase()}/flat/64.png`}
									width="60"
								/>
								<span
									style={{ fontWeight: "bold" }}
								>
									{item.vehicle.type}
								</span>
								<span
									style={{ fontWeight: "bold" }}
								>
									{item.plate}
								</span>
							</div>
						))}
					</div>
				)}
				<Button
					variant="primary"
					type="submit"
					disabled={loading}
					className="orangeBtn"
				>
					{loading ? (
						<Spinner
							animation="border"
							size="sm"
						/>
					) : (
						"Recognize Plate"
					)}
				</Button>
			</Form>
		</div>
	);
};

export default PlateRecognizerForm;
