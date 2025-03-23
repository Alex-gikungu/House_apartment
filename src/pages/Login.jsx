import React, { useState } from "react";
import { Container, Form, Button, Alert, Card } from "react-bootstrap";
import { Mail, Lock } from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Add handleChange function to update formData state
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:5000/login", formData);
      console.log("Login response:", response.data); // Debug
      if (response.status === 200) {
        const { userId, token } = response.data;
        console.log("Extracted userId:", userId); // Debug
        localStorage.setItem("userId", userId);
        localStorage.setItem("token", token || ""); // Handle if token isn’t returned
        console.log("Stored userId:", localStorage.getItem("userId")); // Debug
        setSuccess(true);
        setError("");
        onLogin();
        navigate("/");
      }
    } catch (err) {
      setError("Invalid email or password. Please try again.");
      setSuccess(false);
    }
  };

  const responseGoogle = async (credentialResponse) => {
    const { credential } = credentialResponse;
    try {
      const res = await axios.post("http://127.0.0.1:5000/google-login", { idToken: credential });
      console.log("Google login response:", res.data); // Debug
      if (res.status === 200) {
        const { userId, token } = res.data;
        console.log("Google extracted userId:", userId); // Debug
        localStorage.setItem("userId", userId);
        localStorage.setItem("token", token || ""); // Handle if token isn’t returned
        console.log("Stored userId from Google:", localStorage.getItem("userId")); // Debug
        setSuccess(true);
        setError("");
        onLogin();
        navigate("/");
      }
    } catch (err) {
      setError("Google login failed. Please try again.");
      setSuccess(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId="702134413636-ia4lgbqlnavedhpd83toc2d04g0afigf.apps.googleusercontent.com">
      <Container className="login-container">
        <h2 className="text-center my-4">Login</h2>
        {success && <Alert variant="success">Login successful! Redirecting...</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        <Card className="login-card">
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <div className="input-wrapper">
                  <Mail className="input-icon" />
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange} // Now defined
                    required
                    placeholder="Enter your email"
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange} // Now defined
                    required
                    placeholder="Enter your password"
                  />
                  <Button variant="link" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? "Hide" : "Show"}
                  </Button>
                </div>
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100 mt-3">
                Login
              </Button>
            </Form>

            {/* Google Login Button */}
            <GoogleLogin
              onSuccess={responseGoogle}
              onFailure={responseGoogle}
              className="w-100 mt-3"
            />
          </Card.Body>
        </Card>
      </Container>
    </GoogleOAuthProvider>
  );
};

export default Login;