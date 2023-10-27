import "../css/DateSlider.css";
import { useRef, useState, useEffect } from "react";

export function DateSlider({ onDateSelect, disabledDates }) {
  const sliderRef = useRef(null);
  const [dates, setDates] = useState([]);

  const todayFormatted = `${new Date().getFullYear()}-${String(
    new Date().getMonth() + 1
  ).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;
  const [selectedDate, setSelectedDate] = useState(todayFormatted);

  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    const currentYear = today.getFullYear(); // Pobierz obecny rok
    tomorrow.setDate(today.getDate() + 1);

    const numberOfDates = 218; // You can adjust the number of dates to display

    const handleDateClick = (date, nextDate) => {
      onDateSelect(date, nextDate);
      setSelectedDate(date);
      console.log("Wybrana data:", date);
    };

    const daysOfWeek = ["niedz.", "pon.", "wt.", "śr.", "czw.", "pt.", "sob."];

    const dateButtons = Array.from({ length: numberOfDates }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
  
      const dayOfWeek = daysOfWeek[date.getDay()];  // Dodajemy to, aby pobrać nazwę dnia tygodnia
  
      let formattedDate;
      if (date.toDateString() === today.toDateString()) {
          formattedDate = "dziś";
      }  else {
          // Jeśli rok danej daty jest równy obecnemu roku, pomiń rok w formacie
          if (date.getFullYear() === currentYear) {
              formattedDate = `${dayOfWeek} ${date.getDate()}.${date.getMonth() + 1}`; // Dodajemy tu dzień tygodnia
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
          
        disabled={disabledDates.includes(apiFormatDate)}
      >
        {formattedDate}
      </button>
      );
    });

    setDates(dateButtons);
  }, [selectedDate,disabledDates]);

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
