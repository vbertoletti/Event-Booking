import React from "react";
import "./BookingsControl.css";

const BookingsControl = props => {
  return (
    <div className="bookings-control">
      <button
        className={props.activeOutputType === "list" ? "active" : ""}
        onClick={() => props.onChange('list')}
      >
        List
      </button>
      <button
        className={props.activeOutputType === "chart" ? "active" : ""}
        onClick={() => props.onChange('chart')}
      >
        Chart
      </button>
    </div>
  );
};

export default BookingsControl;
