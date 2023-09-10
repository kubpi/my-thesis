import "./DateSlider.css";
import { useEffect, useState } from "react";
export function DateSlider() {
  const [isAtEnd, setIsAtEnd] = useState(false);

  useEffect(() => {
    const leftHandle = document.getElementById("leftHandle");
    const rightHandle = document.getElementById("rightHandle");
    const slider = document.getElementById("slider");
    const sliderItems = slider.querySelectorAll("button");
    const itemsPerScreen =
      getComputedStyle(slider).getPropertyValue("--items-per-screen");

    let sliderIndex = 0;

    leftHandle.addEventListener("click", () => {
      if (sliderIndex > 0) {
        sliderIndex--;
        setIsAtEnd(false); // Reset flag when moving left
        updateSlider();
        console.log(sliderIndex);
      }
    });

    rightHandle.addEventListener("click", () => {
      if (sliderIndex < Math.ceil(sliderItems.length / itemsPerScreen)) {
        updateSlider(); // Set flag when reaching the end
        console.log("ceil" + Math.ceil(sliderItems.length / itemsPerScreen));
        console.log("items per scr" + itemsPerScreen);
        console.log("len " + sliderItems.length);
        console.log(sliderIndex);
        sliderIndex++;
      }
    });

    function updateSlider() {
      slider.style.transform = `translateX(calc(${sliderIndex} * -100%))`;
    }
  }, [isAtEnd]);
  return (
    <>
      <div className="row">
        <div className="match">mecze</div>
        <div className="upcomming-matches">
          <div>nadchodzące</div>
          <div>mecze</div>
        </div>
        <div className="container">
          <button className="handle left-handle" id="leftHandle">
            <div className="text">&#8249;</div>
          </button>
          <div className="slider" id="slider">
            <button>6.09</button>
            <button>7.09</button>
            <button>8.09</button>
            <button>9.09</button>
            <button>10.09</button>
            <button>11.09</button>
            <button>12.09</button>
            <button>13.09</button>
            <button>14.09</button>
            <button>15.09</button>
          </div>
          <button className="handle right-handle" id="rightHandle">
            <div className="text">&#8250;</div>
          </button>
        </div>
      </div>
    </>
  );
}
