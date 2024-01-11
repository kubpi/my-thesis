import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const TextSlider = ({ texts, autoPlayInterval = 3000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Function to handle next slide
  const nextSlide = () => {
    const newIndex = (currentIndex + 1) % texts.length;
    setCurrentIndex(newIndex);
  };

  // Function to handle previous slide
  const prevSlide = () => {
    const newIndex = (currentIndex - 1 + texts.length) % texts.length;
    setCurrentIndex(newIndex);
  };

  // Auto play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [currentIndex, autoPlayInterval]);

  return (
    <div className="text-slider">
      <div className="text-slider-item">
        {texts[currentIndex]}
      </div>
      <div className="text-slider-controls">
        <button onClick={prevSlide}>Previous</button>
        <button onClick={nextSlide}>Next</button>
      </div>
    </div>
  );
};

TextSlider.propTypes = {
    texts: PropTypes.arrayOf(PropTypes.string).isRequired,
    autoPlayInterval: PropTypes.number,
  };
  

export default TextSlider;
