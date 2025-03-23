import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullseye, faHandshake, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import "../styles/about.css";

const About = () => {
  const [displayedText, setDisplayedText] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const fullText1 = "Welcome to Vacant Apartment Locator. At Vacant Apartment Locator, we are dedicated to helping you find your perfect home.";
  const fullText2 = "Our mission is to simplify the apartment hunting process by providing a user-friendly platform that connects you with available listings in your desired area.";

  useEffect(() => {
    // Set the initial selected day to the current day
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDay = daysOfWeek[new Date().getDay()];
    setSelectedDay(currentDay);

    let index1 = 0;
    let index2 = 0;

    const typingEffect1 = setInterval(() => {
      if (index1 < fullText1.length) {
        setDisplayedText((prev) => prev + fullText1[index1]);
        index1++;
      } else {
        clearInterval(typingEffect1);
        const typingEffect2 = setInterval(() => {
          if (index2 < fullText2.length) {
            setDisplayedText((prev) => prev + fullText2[index2]);
            index2++;
          } else {
            clearInterval(typingEffect2);
          }
        }, 50);
      }
    }, 50);

    return () => {
      clearInterval(typingEffect1);
    };
  }, []);

  const isOpen = (day) => {
    const currentHour = new Date().getHours();
    const openHours = { 
      Monday: [8, 17], 
      Tuesday: [8, 17], 
      Wednesday: [8, 17], 
      Thursday: [8, 17], 
      Friday: [8, 17], 
      Saturday: [0, 0], // Closed
      Sunday: [0, 0] // Closed
    };

    if (!openHours[day]) {
      return false;
    }

    const hours = openHours[day];
    return hours[0] !== 0 && hours[1] !== 0 && currentHour >= hours[0] && currentHour < hours[1];
  };

  return (
    <Container className="about-container">
      <h1 className="text-center my-4">About Us</h1>
      <Row>
        <Col md={6}>
          <Card className="about-card">
            <Card.Body>
              <Card.Title>Welcome to Vacant Apartment Locator</Card.Title>
              <Card.Text>
                {displayedText}
              </Card.Text>
              <Card.Text>
                <strong>Our Mission:</strong> 
                <FontAwesomeIcon icon={faBullseye} className="ms-2" />
                To simplify the apartment hunting process and provide exceptional service.
              </Card.Text>
              <Card.Text>
                <strong>Core Values:</strong>
                <div className="core-values">
                  <div className="value-item">
                    <FontAwesomeIcon icon={faHandshake} />
                    <span>Integrity</span>
                  </div>
                  <div className="value-item">
                    <FontAwesomeIcon icon={faLightbulb} />
                    <span>Innovation</span>
                  </div>
                  <div className="value-item">
                    <FontAwesomeIcon icon={faBullseye} />
                    <span>Customer Service</span>
                  </div>
                </div>
              </Card.Text>
              <Button variant="primary" as={Link} to="/apartments">Explore Listings</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="about-card">
            <Card.Body>
              <Card.Title>Our Location</Card.Title>
              <Card.Text>
                We are located in the heart of the city, making it easy for you to visit us and discuss your apartment needs. Feel free to stop by our office or contact us for more information.
              </Card.Text>
              <div className="map-container">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d31908.897218519614!2d36.69907945524104!3d-1.408886208977835!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2ske!4v1742286735223!5m2!1sen!2ske"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Vacant Apartment Locator Location"
                />
              </div>
              <div className="working-hours">
                <h5>Working Hours</h5>
                <Form.Select 
                  value={selectedDay} 
                  onChange={(e) => setSelectedDay(e.target.value)}
                >
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </Form.Select>
                <div className="status-indicator" style={{ color: isOpen(selectedDay) ? 'green' : 'red' }}>
                  <FontAwesomeIcon icon={isOpen(selectedDay) ? 'circle' : 'times-circle'} />
                  <span>{isOpen(selectedDay) ? ' Open' : ' Closed'}</span>
                </div>
                <p>Monday to Friday: 8 AM - 5 PM</p>
                <p>Saturday and Sunday: Closed</p>
              </div>
              <img src="https://t3.ftcdn.net/jpg/00/71/38/26/360_F_71382624_mBdMvsm9E5fuRJbtJZyDQ06hR3J6mchO.jpg" alt="Our Office" className="about-image" />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default About;