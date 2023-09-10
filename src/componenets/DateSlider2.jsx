export function DateSlider() {
    return (
      <>
        <div className="match">mecze</div>
        <div className="upcomming-matches">
          <div>nadchodzące</div>
          <div>mecze</div>
        </div>
        <div className="container">
          <button className="handle left-handle">
            <div className="text">&#8249;</div>
          </button>
          <div className="slider">
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
          <button className="handle right-handle">
            <div className="text">&#8250;</div>
          </button>
        </div>
      </>
    );
  }
  