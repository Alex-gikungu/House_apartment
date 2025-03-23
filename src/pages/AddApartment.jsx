import React, { useState } from "react";
import { Container, Form, Button, Card, Alert } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/addApartment.css";

const townsInKenya = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Thika",
  "Meru",
  "Nyeri",
  "Malindi",
  "Kitale",
  "Lamu",
  "Machakos",
  "Murang'a",
];

const featuresList = [
  "Swimming Pool",
  "Gym",
  "Parking",
  "Garden",
  "Balcony",
  "Air Conditioning",
  "Wi-Fi",
  "Furnished",
  "Pet Friendly",
];

const AddApartment = () => {
  const [apartment, setApartment] = useState({
    name: "",
    location: "",
    price: "",
    phone: "",
    images: [],
    description: "",
    features: [],
    tour3D: "",
  });

  const [uploadMethod, setUploadMethod] = useState("upload");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setApartment({ ...apartment, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 8); // Limit to 8 files
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setApartment({ ...apartment, images: imageUrls });
  };

  const handleUrlChange = (e, index) => {
    const newImages = [...apartment.images];
    newImages[index] = e.target.value;
    setApartment({ ...apartment, images: newImages });
  };

  const addImageUrlField = () => {
    if (apartment.images.length < 8) { // Check if less than 8 URLs
      setApartment((prev) => ({
        ...prev,
        images: [...prev.images, ""],
      }));
    }
  };

  const handleFeatureChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setApartment((prev) => ({
        ...prev,
        features: [...prev.features, value],
      }));
    } else {
      setApartment((prev) => ({
        ...prev,
        features: prev.features.filter((feature) => feature !== value),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const apartmentData = {
      name: apartment.name,
      location: apartment.location,
      price: apartment.price,
      phone: apartment.phone,
      images: apartment.images,
      description: apartment.description,
      features: apartment.features,
      tour3D: apartment.tour3D,
    };

    try {
      const response = await axios.post("http://127.0.0.1:5000/apartments", apartmentData);
      if (response.status === 201) {
        setSuccess(true);
        setError("");
        console.log("Apartment added successfully:", response.data);
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || "An error occurred while adding the apartment.");
      } else if (err.request) {
        setError("No response from the server. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      setSuccess(false);
    }
  };

  return (
    <div className="add-apartment-page">
      <Container className="content-container">
        <Card className="info-card">
          <Card.Body>
            <h2 className="title">List Your Apartment</h2>
            <p className="info-text">
              Fill out the form below to add your apartment to our listings. Include a 3D tour link for an interactive experience!
            </p>
          </Card.Body>
        </Card>

        <Card className="form-card">
          <Card.Body>
            <h3 className="form-title">Apartment Details</h3>
            {success && <Alert variant="success">Apartment added successfully! Redirecting...</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Apartment Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  onChange={handleChange}
                  placeholder="E.g., Modern 2-Bedroom Apartment"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  as="select"
                  name="location"
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a town</option>
                  {townsInKenya.map((town, index) => (
                    <option key={index} value={town}>{town}</option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Price (Ksh per month)</Form.Label>
                <Form.Control
                  type="text"
                  name="price"
                  onChange={handleChange}
                  placeholder="E.g., 25,000"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  onChange={handleChange}
                  placeholder="E.g., 0700 000 000"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Choose Upload Method</Form.Label>
                <Form.Check
                  type="radio"
                  label="Upload Images"
                  name="uploadMethod"
                  value="upload"
                  checked={uploadMethod === "upload"}
                  onChange={() => setUploadMethod("upload")}
                />
                <Form.Check
                  type="radio"
                  label="Enter Image URLs"
                  name="uploadMethod"
                  value="url"
                  checked={uploadMethod === "url"}
                  onChange={() => setUploadMethod("url")}
                />
              </Form.Group>

              {uploadMethod === "upload" && (
                <Form.Group className="mb-3">
                  <Form.Label>Upload Images (JPEG, JPG)</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".jpeg,.jpg"
                    multiple
                    onChange={handleFileChange}
                    required
                  />
                  <Form.Text className="text-muted">
                    You can upload multiple images (max 8).
                  </Form.Text>
                </Form.Group>
              )}

              {uploadMethod === "url" && (
                <Form.Group className="mb-3">
                  <Form.Label>Image URLs</Form.Label>
                  {apartment.images.map((image, index) => (
                    <div key={index} className="mb-2">
                      <Form.Control
                        type="text"
                        value={image}
                        onChange={(e) => handleUrlChange(e, index)}
                        placeholder="Enter image URL"
                        required
                      />
                    </div>
                  ))}
                  {apartment.images.length < 8 && (
                    <Button variant="link" onClick={addImageUrlField}>
                      Add Another Image URL
                    </Button>
                  )}
                  <Form.Text className="text-muted">
                    You can enter up to 8 image URLs.
                  </Form.Text>
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  onChange={handleChange}
                  placeholder="Write a brief description of the apartment"
                  rows={3}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Features</Form.Label>
                {featuresList.map((feature, index) => (
                  <Form.Check
                    key={index}
                    type="checkbox"
                    label={feature}
                    value={feature}
                    onChange={handleFeatureChange}
                  />
                ))}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>3D Tour URL (Optional)</Form.Label>
                <Form.Control
                  type="text"
                  name="tour3D"
                  onChange={handleChange}
                  placeholder="E.g., https://my.matterport.com/show/?m=abc123"
                />
                <Form.Text className="text-muted">
                  Enter a URL to a 3D tour (e.g., Matterport, Kuula, etc.).
                </Form.Text>
              </Form.Group>

              <Button variant="success" type="submit" className="submit-btn">
                Submit Listing
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default AddApartment;