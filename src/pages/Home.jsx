import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Card, Button, Modal, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { MapPin, Wallet, CheckCircle, Search, User, Star, Phone } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/home.css";

// Custom icon for Leaflet marker
const customMarker = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
  iconSize: [30, 30],
});

const Home = () => {
  const [showModal, setShowModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false); // Added for review modal
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [apartments, setApartments] = useState([]);
  const [filteredApartments, setFilteredApartments] = useState([]);
  const [displayLimit, setDisplayLimit] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [favoriteStatus, setFavoriteStatus] = useState({});
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [reviewerName, setReviewerName] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedImage, setExpandedImage] = useState(null);
  const messages = [
    "Discover Your Ideal Home in Kenya!",
    "Unlock the Door to Your Next Adventure!",
    "Browse Stunning Apartments Just for You!",
    "Your Perfect Space is Waiting!",
  ];
  const messageIndexRef = useRef(0);
  const typingRef = useRef(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/apartments")
      .then((response) => response.json())
      .then((data) => {
        const fetchedApartments = data.apartments || [];
        setApartments(fetchedApartments);
        setFilteredApartments(fetchedApartments.slice(0, 3));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching apartments:", error);
        setError(error.message);
        setLoading(false);
      });

    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
      setReviewerName(storedName);
    }

    const storedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(storedFavorites);
    const initialFavoriteStatus = {};
    storedFavorites.forEach((id) => (initialFavoriteStatus[id] = true));
    setFavoriteStatus(initialFavoriteStatus);

    typeWelcomeMessage();

    return () => clearTimeout(typingRef.current);
  }, []);

  const typeWelcomeMessage = () => {
    const currentMessage = messages[messageIndexRef.current];
    let charIndex = 0;

    const typeChar = () => {
      if (charIndex <= currentMessage.length) {
        setWelcomeMessage(currentMessage.slice(0, charIndex));
        charIndex++;
        typingRef.current = setTimeout(typeChar, 200);
      } else {
        messageIndexRef.current = (messageIndexRef.current + 1) % messages.length;
        setTimeout(typeWelcomeMessage, 3000);
      }
    };

    typeChar();
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    filterApartments(query, priceFilter);

    if (query) {
      const filteredSuggestions = apartments
        .filter(
          (apartment) =>
            apartment &&
            typeof apartment.name === "string" &&
            apartment.name.toLowerCase().includes(query)
        )
        .map((apartment) => apartment.name);
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
      setFilteredApartments(apartments.slice(0, displayLimit));
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    filterApartments(suggestion.toLowerCase(), priceFilter);
    setSuggestions([]);
  };

  const handlePriceFilter = (event) => {
    const priceRange = event.target.value;
    setPriceFilter(priceRange);
    filterApartments(searchQuery, priceRange);
  };

  const filterApartments = (query, priceRange) => {
    let filtered = [...apartments];

    if (query) {
      filtered = filtered.filter(
        (apartment) =>
          apartment &&
          typeof apartment.name === "string" &&
          apartment.name.toLowerCase().includes(query)
      );
    }

    if (priceRange) {
      filtered = filtered.filter((apartment) => {
        if (!apartment || typeof apartment.price !== "number") return false;
        const price = apartment.price;
        if (priceRange === "below-10000") return price < 10000;
        if (priceRange === "10000-20000") return price >= 10000 && price <= 20000;
        if (priceRange === "above-20000") return price > 20000;
        return true;
      });
    }

    setFilteredApartments(filtered);
  };

  const handleShowMore = () => {
    setDisplayLimit(filteredApartments.length);
  };

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
    setExpandedImage(null);
  };

  const handleReviewModalOpen = () => setShowReviewModal(true);
  const handleReviewModalClose = () => {
    setShowReviewModal(false);
    setNewReview("");
    setNewRating(0);
  };

  const toggleFavorite = (apartment) => {
    const updatedFavorites = favorites.includes(apartment.id)
      ? favorites.filter((id) => id !== apartment.id)
      : [...favorites, apartment.id];
    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    setFavoriteStatus((prevStatus) => ({
      ...prevStatus,
      [apartment.id]: !prevStatus[apartment.id],
    }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem("userId");
    if (!userId || isNaN(Number(userId))) {
      alert("You must be logged in with a valid user ID to submit a review.");
      return;
    }

    const userIdNum = Number(userId);
    const reviewData = {
      review_text: newReview,
      rating: Number(newRating),
      user_id: userIdNum,
      apartment_id: selectedApartment.id,
    };

    try {
      const response = await fetch("http://127.0.0.1:5000/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to submit review: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      setReviews([...reviews, { ...reviewData, id: data.review_id, reviewer: reviewerName }]);
      handleReviewModalClose();
    } catch (error) {
      console.error("Error submitting review:", error.message);
      alert(`Failed to submit review: ${error.message}`);
    }
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

  if (loading) return <h2>Loading apartments...</h2>;
  if (error) return <h2>Error: {error}</h2>;

  return (
    <Container className="apartments py-5">
      <h1 className="welcome-text text-center mb-4">{welcomeMessage}</h1>
      <h2 className="section-title text-center mb-4">Featured Apartments</h2>

      <Row className="justify-content-center mb-5">
        <Col md={6}>
          <Form.Group controlId="search">
            <Form.Label>Search Apartments</Form.Label>
            <div className="search-box">
              <Form.Control
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={handleSearch}
              />
              <Search size={20} className="search-icon" />
            </div>
            {suggestions.length > 0 && (
              <div className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="priceFilter">
            <Form.Label>Filter by Price</Form.Label>
            <Form.Control as="select" value={priceFilter} onChange={handlePriceFilter}>
              <option value="">All Prices</option>
              <option value="below-10000">Below 10,000</option>
              <option value="10000-20000">10,000 - 20,000</option>
              <option value="above-20000">Above 20,000</option>
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>

      <Row className="g-4">
        {filteredApartments.length > 0 ? (
          filteredApartments.slice(0, displayLimit).map((apartment) => (
            <Col md={6} lg={4} key={apartment.id}>
              <Card className="apartment-card h-100 shadow-sm">
                <Card.Img
                  variant="top"
                  src={apartment.images[0] || "https://via.placeholder.com/300"}
                  alt={apartment.name || "Apartment"}
                />
                <Card.Body>
                  <Card.Title>{apartment.name || "Untitled"}</Card.Title>
                  <Card.Text>
                    <MapPin size={16} /> {apartment.location || "Unknown"} <br />
                    <Wallet size={16} /> ${apartment.price || "N/A"}/month
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
          ))
        ) : (
          <Col>
            <h3>No apartments found</h3>
          </Col>
        )}
      </Row>

      {filteredApartments.length > 3 && displayLimit < filteredApartments.length && (
        <Row className="justify-content-center mt-4">
          <Col md={4} className="text-center">
            <Button variant="outline-primary" onClick={handleShowMore}>
              More Apartments
            </Button>
          </Col>
        </Row>
      )}

      {selectedApartment && (
        <>
          <Modal show={showModal} onHide={handleClose} size="xl" centered>
            <Modal.Header closeButton>
              <Modal.Title>{selectedApartment.name || "Untitled"}</Modal.Title>
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
                        <Popup>{selectedApartment.name || "Untitled"}</Popup>
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
                  <p><MapPin size={20} /> <strong>Location:</strong> {selectedApartment.location || "Unknown"}</p>
                  <p><Wallet size={20} /> <strong>Price:</strong> ${selectedApartment.price || "N/A"}/month</p>
                </Col>
                <Col md={6}>
                  <p><strong>Description:</strong> {selectedApartment.description || "No description available"}</p>
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
                    <ul className="no-bullets">
                      {reviews.map((review, index) => (
                        <li key={index}>
                          <div className="reviewer">
                            <User size={20} className="icon" />
                            <strong>{review.reviewer || "Anonymous"}</strong>
                          </div>
                          {renderStars(review.rating)}
                          <p className="review-text">{review.review_text}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No reviews yet.</p>
                  )}
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
              <Link to={`/bookings/${selectedApartment.id}`}>
                <Button variant="success">Book Visit</Button>
              </Link>
            </Modal.Footer>
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

export default Home;