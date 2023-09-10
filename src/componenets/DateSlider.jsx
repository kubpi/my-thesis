import "./DateSlider.css";
import { useRef } from "react";

export function DateSlider() {
  const sliderRef = useRef(null);

  const handleLeftClick = () => {
    // Obsługa kliknięcia w lewy przycisk
    const slider = sliderRef.current;
    let sliderIndex =
      parseInt(slider.style.getPropertyValue("--slider-index"), 10) || 0;

    if (sliderIndex > 0) {
      sliderIndex--;

      slider.style.setProperty("--slider-index", sliderIndex);
      console.log(sliderIndex);
    }
  };

  const handleRightClick = () => {
    // Obsługa kliknięcia w prawy przycisk
    const slider = sliderRef.current;
    const itemsPerScreen =
      parseInt(
        getComputedStyle(slider).getPropertyValue("--items-per-screen"),
        10
      ) || 1;
    let sliderIndex =
      parseInt(slider.style.getPropertyValue("--slider-index"), 10) || 0;
    const maxIndex = Math.ceil(slider.children.length / itemsPerScreen) - 1;

    if (sliderIndex < maxIndex) {
      sliderIndex++;

      slider.style.setProperty("--slider-index", sliderIndex);
      console.log("ceil" + Math.ceil(slider.children.length / itemsPerScreen));
      console.log("items per scr" + itemsPerScreen);
      console.log("len " + slider.children.length);
      console.log(sliderIndex);
    }
  };

  return (
    <>
      <div className="container1">
        <div className="row">
          <div className="col-sm">
            <div className="container">
              <button className="handle left-handle" onClick={handleLeftClick}>
                <div className="text">&#8249;</div>
              </button>
              <div className="slider" ref={sliderRef}>
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
              <button
                className="handle right-handle"
                onClick={handleRightClick}
              >
                <div className="text">&#8250;</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
