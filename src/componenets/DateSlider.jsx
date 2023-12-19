import "../css/DateSlider.css";
import { useRef, useState, useEffect, useCallback } from "react";

export function DateSlider({ onDateSelect, disabledDates, timeBackNumber }) {
  const sliderRef = useRef(null);
  const [dates, setDates] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const handleResize = () => {
    // Zaktualizuj stan tylko gdy szerokość okna się zmieniła
    if (window.innerWidth !== windowWidth) {
      setWindowWidth(window.innerWidth);
    }
  };

  const todayFormatted = `${new Date().getFullYear()}-${String(
    new Date().getMonth() + 1
  ).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;
  const [selectedDate, setSelectedDate] = useState(todayFormatted);

  useEffect(() => {
    const today = new Date();
    const weekBefore = new Date(today); // Nowa data reprezentująca tydzień przed dzisiaj
    weekBefore.setDate(today.getDate() - timeBackNumber); // Odejmujemy 7 dni, aby uzyskać datę sprzed tygodnia
    const currentYear = today.getFullYear();
  
    const numberOfDates = 218 + 120; // Dodajemy 7 dni do istniejącej liczby dni

    const handleDateClick = (date, nextDate) => {
      onDateSelect(date, nextDate);
      setSelectedDate(date);
      console.log("Wybrana data:", date);
    };

    const daysOfWeek = ["niedz.", "pon.", "wt.", "śr.", "czw.", "pt.", "sob."];

    const dateButtons = Array.from({ length: numberOfDates }, (_, index) => {
      const date = new Date(weekBefore);
      date.setDate(weekBefore.getDate() + index);
  
      const dayOfWeek = daysOfWeek[date.getDay()];  // Dodajemy to, aby pobrać nazwę dnia tygodnia
  
      let formattedDate;
      if (date.toDateString() === today.toDateString()) {
        formattedDate = "dziś";
      } else {
        // Jeśli rok danej daty jest równy obecnemu roku, pomiń rok w formacie
        if (date.getFullYear() === currentYear) {
          formattedDate = `${dayOfWeek} ${date.getDate()}.${date.getMonth() + 1}`; // Dodajemy tu dzień tygodnia
        } else {
          formattedDate = `${dayOfWeek} ${date.getDate()}.${date.getMonth() + 1
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
          data-raw-date={apiFormatDate} // Dodaj to
          disabled={disabledDates.includes(apiFormatDate)}
        >
          {formattedDate}
        </button>
      );
    });

    setDates(dateButtons);
    

 
  }, [selectedDate,disabledDates]);

 
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    // Czyszczenie nasłuchiwania
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize,windowWidth]); // Teraz useEffect reaguje tylko na zmianę szerokości okna

  const centerSelectedDate = useCallback(() => {
    const slider = sliderRef.current;
    if (!slider) return;
  
    const itemsPerScreen = parseInt(
      getComputedStyle(slider).getPropertyValue("--items-per-screen"),
      10
    );
  console.log(itemsPerScreen)
    // Znalezienie indeksu wybranej daty
    const selectedIndex = Array.from(sliderRef.current.children).findIndex(
      (child) => child.getAttribute('data-raw-date') === selectedDate
    );
    
    console.log(selectedIndex)
    if (selectedIndex >= 0) {
      let howMuchAdd;
      if (itemsPerScreen === 8) {
        howMuchAdd = -0.02
      } else if(itemsPerScreen === 4){
        howMuchAdd = 0.75
      } else if(itemsPerScreen === 2){
        howMuchAdd = 1.5
      } else if(itemsPerScreen === 1){
        howMuchAdd = 1.5
      }
      let sliderIndex = selectedIndex / Math.floor(itemsPerScreen)+howMuchAdd;
      console.log(sliderIndex)
      // sliderIndex = Math.max(0, sliderIndex); // Zapewnienie, że indeks nie jest ujemny
      // sliderIndex = Math.min(sliderIndex, dates.length - itemsPerScreen); // Zapewnienie, że nie przesuniemy za daleko na koniec
    
      // Ustawienie właściwości CSS
      slider.style.setProperty("--slider-index", sliderIndex);
  }
    
  }, [dates, selectedDate, windowWidth]);
  
  useEffect(() => {
    // Teraz centerSelectedDate zostanie wywołane tylko wtedy, gdy zmieni się szerokość okna
    centerSelectedDate();
  }, [windowWidth]); // Dodano zależność od windowWidth


  useEffect(() => {
// Nowy kod do ustawienia suwaka na dzisiejszą datę
//const todayIndex = 11.8; // Ponieważ odejmujesz 30 dni od dzisiejszej daty, indeks dla 'dziś' to 30
const todayIndex = 23; // Ponieważ odejmujesz 30 dni od dzisiejszej daty, indeks dla 'dziś' to 30
const slider = sliderRef.current;
    const itemsPerScreen = parseInt(
      getComputedStyle(slider).getPropertyValue("--items-per-screen"),
      10
    );
    console.log(itemsPerScreen)
    let sliderIndex
    // Ustaw właściwość CSS, aby przesunąć suwak do 'dzisiaj'
    if (itemsPerScreen === 4) {
      sliderIndex = 34.4 - Math.floor(itemsPerScreen);
    }
    else if (itemsPerScreen === 8) {
      sliderIndex = 23 - Math.floor(itemsPerScreen);
    } else if (itemsPerScreen === 2) {
      sliderIndex = 63.1 -  Math.floor(itemsPerScreen)
    } else if (itemsPerScreen === 1) {
      sliderIndex = 122.5 -  Math.floor(itemsPerScreen)
    }

    slider.style.setProperty("--slider-index", sliderIndex >= 0 ? sliderIndex : 0);
   
  },[])
  
  const handleLeftClick = () => {
    // Obsługa kliknięcia w lewy przycisk
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
        howMuchAdd = 0
      } else if(itemsPerScreen === 4){
        howMuchAdd = 0.
      } else if(itemsPerScreen === 2){
        howMuchAdd = 0
      } else if(itemsPerScreen === 1){
        howMuchAdd = 0.5
      }
      slider.style.setProperty("--slider-index", sliderIndex+howMuchAdd);
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

      slider.style.setProperty("--slider-index", sliderIndex+0.5);
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
