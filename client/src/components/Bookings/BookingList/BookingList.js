import React from "react";
import "./BookingList.css";

const BookingList = props => {
  return (
    <ul className="bookings-list-wrapper">
      {props.bookings.map(booking => (
        <li key={booking._id} className="bookings-list-item">
          <div className="bookings-item-content">
            {booking.event.title} -
            {new Date(booking.createdAt).toLocaleString()}
          </div>
          <div className="bookings-item-button">
            <button
              className="btn"
              onClick={props.onDelete.bind(this, booking._id)}
            >
              Cancel Booking
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default BookingList;
