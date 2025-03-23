import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Modal, Form, Alert } from "react-bootstrap";
import { MapPin, Wallet, CheckCircle, User, Star, Phone } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/apartments.css";

// Custom Leaflet marker icon
const customMarker = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
  iconSize: [30, 30],
});

const Apartment = () => {
  const [showModal, setShowModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [reviewerName, setReviewerName] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [favoriteStatus, setFavoriteStatus] = useState({});
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [locationFilter, setLocationFilter] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedImage, setExpandedImage] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/apartments")
      .then((response) => response.json())
      .then((data) => {
        setApartments(data.apartments);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching apartments:", error);
        setError(error.message);
        setLoading(false);
      });

    const storedName = localStorage.getItem("userName");
    if (storedName) setReviewerName(storedName);

    const storedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(storedFavorites);
    const initialFavoriteStatus = {};
    storedFavorites.forEach((id) => (initialFavoriteStatus[id] = true));
    setFavoriteStatus(initialFavoriteStatus);
  }, []);

  const handleShow = (apartment) => {
    setSelectedApartment(apartment);
    fetchReviews(apartment.id);
    setShowModal(true);
    setCurrentImageIndex(0);
    setExpandedImage(null);
  };

  const fetchReviews = (apartmentId) => {
    fetch(`http://127.0.0.1:5000/apartments/${apartmentId}/reviews`)
      .then((response) => response.json())
      .then((data) => setReviews(data))
      .catch((error) => console.error("Error fetching reviews:", error));
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedApartment(null);
    setShowAllReviews(false);
    setExpandedImage(null);
  };

  const handleReviewModalOpen = () => setShowReviewModal(true);
  const handleReviewModalClose = () => {
    setShowReviewModal(false);
    setNewReview("");
    setNewRating(0);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("You must be logged in to submit a review.");
      return;
    }

    const reviewData = {
      review_text: newReview,
      rating: newRating,
      user_id: userId,
      apartment_id: selectedApartment.id,
    };

    fetch("http://127.0.0.1:5000/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewData),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to submit review");
        return response.json();
      })
      .then((data) => {
        setReviews([...reviews, { ...reviewData, id: data.review_id, reviewer: reviewerName }]);
        handleReviewModalClose();
      })
      .catch((error) => {
        console.error("Error submitting review:", error);
        alert("Failed to submit review. Please try again.");
      });
  };

  const toggleFavorite = (apartment) => {
    const updatedFavorites = favorites.includes(apartment.id)
      ? favorites.filter((id) => id !== apartment.id)
      : [...favorites, apartment.id];
    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    setFavoriteStatus((prev) => ({ ...prev, [apartment.id]: !prev[apartment.id] }));
  };

  const renderStars = (rating) => (
    <div className="star-rating">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          size={20}
          className={`star ${index < rating ? "filled" : "empty"}`}
        />
      ))}
    </div>
  );

  const filteredApartments = apartments.filter((apartment) =>
    apartment.location.toLowerCase().includes(locationFilter.toLowerCase())
  );

  const handleNextImage = () => {
    if (currentImageIndex < selectedApartment.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      setCurrentImageIndex(0);
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else {
      setCurrentImageIndex(selectedApartment.images.length - 1);
    }
  };

  const handleImageClick = (image, index) => {
    setExpandedImage(expandedImage === image ? null : image);
    setCurrentImageIndex(index);
  };

  if (loading) return <Container className="text-center mt-5">Loading...</Container>;
  if (error) return <Container className="text-center mt-5"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container fluid className="apartment-container py-5">
      <h2 className="text-center mb-4">🏡 Available Apartments</h2>
      <Row className="justify-content-center mb-5">
        <Col md={8} lg={6}>
          <Form.Control
            type="text"
            placeholder="Search by Location"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="shadow-sm"
          />
        </Col>
      </Row>

      <Row className="g-4">
        {filteredApartments.map((apartment) => (
          <Col key={apartment.id} md={6} lg={4}>
            <Card className="apartment-card h-100 shadow-sm">
              <Card.Img variant="top" src={apartment.images?.[0] || "https://via.placeholder.com/300"} />
              <Card.Body>
                <Card.Title>{apartment.name}</Card.Title>
                <Card.Text>
                  <MapPin size={16} /> {apartment.location} <br />
                  <Wallet size={16} /> ${apartment.price}/month
                </Card.Text>
                <Button variant="primary" onClick={() => handleShow(apartment)} className="w-100 mb-2">
                  View Details
                </Button>
                <Button
                  className={`w-100 ${favoriteStatus[apartment.id] ? "active" : ""}`}
                  onClick={() => toggleFavorite(apartment)}
                >
                  {favoriteStatus[apartment.id] ? "Remove from Favorites" : "Add to Favorites"}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {selectedApartment && (
        <>
          <Modal show={showModal} onHide={handleClose} size="xl" centered>
            <Modal.Header closeButton>
              <Modal.Title>{selectedApartment.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-body-custom">
              <Row>
                <Col md={7}>
                  <h5>📷 3D Tour</h5>
                  {selectedApartment.tour3D ? (
                    <iframe
                      src={selectedApartment.tour3D}
                      width="100%"
                      height="400px"
                      frameBorder="0"
                      allowFullScreen
                      title="3D Tour"
                    />
                  ) : (
                    <p>No 3D tour available.</p>
                  )}
                </Col>
                <Col md={5}>
                  <h5>🗺️ Map</h5>
                  {selectedApartment.latitude && selectedApartment.longitude ? (
                    <MapContainer
                      center={[selectedApartment.latitude, selectedApartment.longitude]}
                      zoom={15}
                      style={{ height: "400px", width: "100%" }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      />
                      <Marker position={[selectedApartment.latitude, selectedApartment.longitude]} icon={customMarker}>
                        <Popup>{selectedApartment.name}</Popup>
                      </Marker>
                    </MapContainer>
                  ) : (
                    <p>Location data not available</p>
                  )}
                </Col>
              </Row>

              <Row className="mt-3">
                <Col>
                  <div className="image-gallery">
                    {selectedApartment.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${selectedApartment.name} ${index + 1}`}
                        className={`gallery-image ${index === currentImageIndex ? "active" : ""} ${expandedImage === image ? "expanded" : ""}`}
                        onClick={() => handleImageClick(image, index)}
                      />
                    ))}
                    <span
                      className="arrow prev-arrow"
                      onClick={handlePrevImage}
                      style={{ display: currentImageIndex === 0 && selectedApartment.images.length > 1 ? "block" : "none" }}
                    >
                      ❮
                    </span>
                    <span
                      className="arrow next-arrow"
                      onClick={handleNextImage}
                      style={{ display: currentImageIndex === selectedApartment.images.length - 1 && selectedApartment.images.length > 1 ? "none" : "block" }}
                    >
                      ❯
                    </span>
                  </div>
                </Col>
              </Row>

              <Row className="mt-3">
                <Col md={6}>
                  <p><MapPin size={20} /> <strong>Location:</strong> {selectedApartment.location}</p>
                  <p><Wallet size={20} /> <strong>Price:</strong> ${selectedApartment.price}/month</p>
                </Col>
                <Col md={6}>
                  <p><strong>Description:</strong> {selectedApartment.description}</p>
                  <p>
                    <strong>Contact:</strong>{" "}
                    {selectedApartment.phone ? (
                      <a href={`tel:${selectedApartment.phone}`} className="phone-link">
                        <Phone size={20} className="icon text-success me-1" />
                        {selectedApartment.phone}
                      </a>
                    ) : (
                      "Not available"
                    )}
                  </p>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <h5>🏠 Features</h5>
                  <ul className="no-bullets">
                    {selectedApartment.features?.map((feature, index) => (
                      <li key={index} className="feature-item">
                        <CheckCircle size={16} className="icon text-success" /> {feature}
                      </li>
                    ))}
                  </ul>
                </Col>
                <Col md={6}>
                  <Button variant="primary" onClick={handleReviewModalOpen} className="mb-3">
                    Give Review
                  </Button>
                  <h5>💬 Reviews</h5>
                  {reviews.length > 0 ? (
                    <>
                      {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review, index) => (
                        <div key={index}>
                          <div className="reviewer">
                            <User size={20} /> <strong>{review.reviewer}</strong>
                          </div>
                          {renderStars(review.rating)}
                          <p>{review.review_text}</p>
                        </div>
                      ))}
                      {reviews.length > 3 && (
                        <Button variant="link" onClick={() => setShowAllReviews(!showAllReviews)}>
                          {showAllReviews ? "Show Less" : "View More"}
                        </Button>
                      )}
                    </>
                  ) : (
                    <p>No reviews yet.</p>
                  )}
                </Col>
              </Row>
            </Modal.Body>
          </Modal>

          <Modal show={showReviewModal} onHide={handleReviewModalClose} centered>
            <Modal.Header closeButton>
              <Modal.Title>Write a Review</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleReviewSubmit}>
                <Form.Group controlId="review">
                  <Form.Label>Your Review</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="rating" className="mt-3">
                  <Form.Label>Your Rating (1-5)</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="5"
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100 mt-3">
                  Submit Review
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
        </>
      )}
    </Container>
  );
};

export default Apartment;