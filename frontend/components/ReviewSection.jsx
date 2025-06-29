"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

export default function ReviewSection() {
  // Always show only these three reviews on the homepage
  const fixedReviews = [
    {
      id: 1001,
      name: "Tushar",
      rating: 5,
      message: "Amazing gym with top-notch equipment...",
      imageUrl: "/1.jpg",
    },
    {
      id: 1002,
      name: "Manan",
      rating: 4,
      message: "Great trainers and friendly environment!",
      imageUrl: "/2.jpg",
    },
    {
      id: 1003,
      name: "Rahul",
      rating: 5,
      message: "I achieved my fitness goals here! Highly recommended.",
      imageUrl: "/3.jpg",
    },
  ];

  const [reviews, setReviews] = useState(fixedReviews);

  const [name, setName] = useState("");
  const [rating, setRating] = useState("");
  const [message, setMessage] = useState("");
  const [allReviews, setAllReviews] = useState([]);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [allBackendReviews, setAllBackendReviews] = useState([]);

  // Fetch all backend reviews on mount and after every submission
  const fetchAllBackendReviews = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/reviews");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setAllBackendReviews(data);
        }
      }
    } catch (err) {
      console.error("Error fetching backend reviews:", err);
    }
  };

  useEffect(() => {
    fetchAllBackendReviews();
  }, []);

  // Calculate average rating from all backend reviews
  const calculateAverageRating = (reviewsList) => {
    if (!reviewsList || reviewsList.length === 0) return 0;
    const totalRating = reviewsList.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / reviewsList.length).toFixed(1);
  };

  // Get total number of reviews
  const getTotalReviews = (reviewsList) => {
    return reviewsList ? reviewsList.length : 0;
  };

  // Validate and sanitize image URL
  const getValidImageUrl = (imageUrl) => {
    if (!imageUrl || imageUrl.trim() === '') {
      return "/1.jpg";
    }
    
    // If it's already a relative path, return as is
    if (imageUrl.startsWith('/')) {
      return imageUrl;
    }
    
    // If it's a valid URL, return it
    try {
      new URL(imageUrl);
      return imageUrl;
    } catch (error) {
      // If URL is invalid, return default
      return "/1.jpg";
    }
  };

  // Handle image loading errors
  const handleImageError = (reviewId) => {
    setImageErrors(prev => new Set(prev).add(reviewId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8080/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          rating: parseInt(rating),
          message,
        }),
      });
      if (!res.ok) {
        const errorBody = await res.text();
        console.error("Error submitting review:", errorBody);
        alert(`Failed to submit review: ${errorBody}`);
        return;
      }
      alert("Review submitted successfully! Thank you for your feedback.");
      setName("");
      setRating("");
      setMessage("");
      // Fetch all backend reviews again to update average/count
      fetchAllBackendReviews();
    } catch (err) {
      console.error("Caught error:", err);
      alert("Network error. Please check your connection and try again.");
    }
}

  return (
    <section className="review" id="review">
      <div className="review-box">
        <h2 className="heading">
          Client <span>Reviews</span>
        </h2>
        {/* Average Rating Display (optional: you can use fixedReviews for this) */}
        <div className="average-rating-container">
          <div className="average-rating-box">
            <div className="average-rating-number">
              {calculateAverageRating(allBackendReviews)}
            </div>
            <div className="average-rating-stars">
              {[...Array(5)].map((_, i) => (
                <i 
                  key={`avg-star-${i}`}
                  className={`bx bx-star ${i < Math.floor(calculateAverageRating(allBackendReviews)) ? 'filled' : ''}`}
                ></i>
              ))}
            </div>
            <div className="average-rating-text">
              Based on {getTotalReviews(allBackendReviews)} reviews
            </div>
          </div>
        </div>
        <div className="wrapper">
          {fixedReviews.map((review, index) => (
            <div className="review-item" key={`${review.id}-${index}`}>
              <Image
                src={imageErrors.has(review.id) ? "/1.jpg" : getValidImageUrl(review.imageUrl)}
                alt={review.name}
                width={150}
                height={150}
                onError={() => handleImageError(review.id)}
                unoptimized={true}
              />
              <h2>{review.name}</h2>
              <div className="rating">
                {[...Array(review.rating)].map((_, i) => (
                  <i className="bx bx-star" id="star" key={`${review.id}-star-${i}`}></i>
                ))}
              </div>
              <p>&quot;{review.message}&quot;</p>
            </div>
          ))}
        </div>
        {/* 👇 Submit Review Form */}
        <div className="review-form-container">
          <h3 className="review-form-title">Share Your Experience</h3>
          <p className="review-form-subtitle">Help others by sharing your fitness journey with us</p>
        <form onSubmit={handleSubmit} className="review-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Your Name</label>
          <input
                  id="name"
            type="text"
                  placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
              </div>
              <div className="form-group">
                <label htmlFor="rating">Rating</label>
                <select
                  id="rating"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            required
                >
                  <option value="">Select rating</option>
                  <option value="1">⭐ 1 Star</option>
                  <option value="2">⭐⭐ 2 Stars</option>
                  <option value="3">⭐⭐⭐ 3 Stars</option>
                  <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                  <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="message">Your Review</label>
          <textarea
                id="message"
                placeholder="Tell us about your experience..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
                rows="4"
          />
            </div>
            <button type="submit" className="submit-review-btn">
              <i className="bx bx-send"></i>
              Submit Review
            </button>
        </form>
        </div>
      </div>
    </section>
  );
}
