// Favorites.js
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { MapPin, Wallet, CheckCircle } from "lucide-react";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [apartments, setApartments] = useState([]);

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(storedFavorites);

    // Fetch apartments data
    fetch("http://127.0.0.1:5000/apartments")
      .then((response) => response.json())
      .then((data) => {
        setApartments(data.apartments);
      })
      .catch((error) => {
        console.error("Error fetching apartments:", error);
      });
  }, []);

  // Filter apartments to show only favorites
  const favoriteApartments = apartments.filter(apartment => favorites.includes(apartment.id));

  return (
    <Container className="favorites">
      <h2>Your Favorite Apartments</h2>
      <Row>
        {favoriteApartments.length > 0 ? (
          favoriteApartments.map((apartment) => (
            <Col md={4} className="mb-4" key={apartment.id}>
              <Card className="apartment-card">
                <Card.Img variant="top" src={apartment.images[0]} alt={apartment.title} />
                <Card.Body>
                  <Card.Title>{apartment.title}</Card.Title>
                  <Card.Text>
                    <MapPin size={16} className="icon" /> <strong>Location:</strong> {apartment.location} <br />
                    <Wallet size={16} className="icon" /> <strong>Price:</strong> {apartment.price}
                  </Card.Text>
                  <Link to={`/bookings/${apartment.id}`}>
                    <Button variant="success">Book Visit</Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            <h3>No favorite apartments found</h3>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default Favorites;