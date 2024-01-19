import "../../css/DateSlider.css";
import { useRef, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";

export function DateSlider({ onDateSelect, disabledDates, timeBackNumber }) {
  const sliderRef = useRef(null);
  const [dates, setDates] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const handleResize = useCallback(() => {
    const newWidth = window.innerWidth;
    if (newWidth !== windowWidth) {
      setWindowWidth(newWidth);
    }
  }, [windowWidth]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  const todayFormatted = `${new Date().getFullYear()}-${String(
    new Date().getMonth() + 1
  ).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;
  const [selectedDate, setSelectedDate] = useState(todayFormatted);

  useEffect(() => {
    const today = new Date();
    const weekBefore = new Date(today);
    weekBefore.setDate(today.getDate() - timeBackNumber);
    const currentYear = today.getFullYear();

    const numberOfDates = 218 + 60;

    const handleDateClick = (date, nextDate) => {
      onDateSelect(date, nextDate);
      setSelectedDate(date);
      console.log("Wybrana data:", date);
    };

    const daysOfWeek = ["niedz.", "pon.", "wt.", "śr.", "czw.", "pt.", "sob."];

    const dateButtons = Array.from({ length: numberOfDates }, (_, index) => {
      const date = new Date(weekBefore);
      date.setDate(weekBefore.getDate() + index);

      const dayOfWeek = daysOfWeek[date.getDay()];

      let formattedDate;
      if (date.toDateString() === today.toDateString()) {
        formattedDate = "dziś";
      } else {
        if (date.getFullYear() === currentYear) {
          formattedDate = `${dayOfWeek} ${date.getDate()}.${
            date.getMonth() + 1
          }`;
        } else {
          formattedDate = `${dayOfWeek} ${date.getDate()}.${
            date.getMonth() + 1
          }.${date.getFullYear()}`;
        }
      }
      const apiFormatDate = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      const apiFormatNextDate = `${nextDate.getFullYear()}-${String(
        nextDate.getMonth() + 1
      ).padStart(2, "0")}-${String(nextDate.getDate()).padStart(2, "0")}`;

      return (
        <button
          key={index}
          onClick={(e) => handleDateClick(apiFormatDate, apiFormatNextDate, e)}
          className={
            apiFormatDate === selectedDate
              ? "button-selected"
              : disabledDates.includes(apiFormatDate)
              ? "button-disabled"
              : ""
          }
          data-raw-date={apiFormatDate}
          disabled={disabledDates.includes(apiFormatDate)}
        >
          {formattedDate}
        </button>
      );
    });

    setDates(dateButtons);
  }, [selectedDate, disabledDates]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize, windowWidth]);

  const centerSelectedDate = useCallback(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const itemsPerScreen = parseInt(
      getComputedStyle(slider).getPropertyValue("--items-per-screen"),
      10
    );
    const selectedIndex = Array.from(sliderRef.current.children).findIndex(
      (child) => child.getAttribute("data-raw-date") === selectedDate
    );

    console.log(selectedIndex);
    if (selectedIndex >= 0) {
      let howMuchAdd;
      if (itemsPerScreen === 8) {
        howMuchAdd = -0.02;
      } else if (itemsPerScreen === 4) {
        howMuchAdd = 0.75;
      } else if (itemsPerScreen === 2) {
        howMuchAdd = 1.5;
      } else if (itemsPerScreen === 1) {
        howMuchAdd = 1.5;
      }
      let sliderIndex = selectedIndex / Math.floor(itemsPerScreen) + howMuchAdd;
      console.log(sliderIndex);
      slider.style.setProperty("--slider-index", sliderIndex);
    }
  }, [dates, selectedDate, windowWidth]);

  useEffect(() => {
    centerSelectedDate();
  }, [windowWidth]);

  useEffect(() => {
    const slider = sliderRef.current;
    const itemsPerScreen = parseInt(
      getComputedStyle(slider).getPropertyValue("--items-per-screen"),
      10
    );
    console.log(itemsPerScreen);
    let sliderIndex;

    if (itemsPerScreen === 4) {
      sliderIndex = 34.4 - Math.floor(itemsPerScreen);
    } else if (itemsPerScreen === 8) {
      sliderIndex = 23 - Math.floor(itemsPerScreen);
    } else if (itemsPerScreen === 2) {
      sliderIndex = 63.1 - Math.floor(itemsPerScreen);
    } else if (itemsPerScreen === 1) {
      sliderIndex = 122.5 - Math.floor(itemsPerScreen);
    }

    slider.style.setProperty(
      "--slider-index",
      sliderIndex >= 0 ? sliderIndex : 0
    );
  }, []);

  const handleLeftClick = () => {
    const slider = sliderRef.current;
    let sliderIndex =
      parseInt(slider.style.getPropertyValue("--slider-index"), 10) || 0;
    const itemsPerScreen =
      parseInt(
        getComputedStyle(slider).getPropertyValue("--items-per-screen"),
        10
      ) || 1;
    if (sliderIndex > 0) {
      sliderIndex--;
      let howMuchAdd;
      if (itemsPerScreen === 8) {
        howMuchAdd = 0;
      } else if (itemsPerScreen === 4) {
        howMuchAdd = 0;
      } else if (itemsPerScreen === 2) {
        howMuchAdd = 0;
      } else if (itemsPerScreen === 1) {
        howMuchAdd = 0.5;
      }
      slider.style.setProperty("--slider-index", sliderIndex + howMuchAdd);
      console.log(sliderIndex);
    }
  };

  const handleRightClick = () => {
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

      slider.style.setProperty("--slider-index", sliderIndex + 0.5);
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
              <div className="over">
                <div className="slider" ref={sliderRef}>
                  {dates}
                </div>
              </div>
              <button
                className="handle right-handle "
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
DateSlider.propTypes = {
  onDateSelect: PropTypes.func,
  disabledDates: PropTypes.string,
  timeBackNumber: PropTypes.number,
};
