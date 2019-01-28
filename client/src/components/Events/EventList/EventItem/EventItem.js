import React from "react";
import "./EventItem.css";

const EventItem = props => {
  return (
    <li key={props._id} className="events-list-item">
      <div>
        <h1 className="event-item-title">{props.event.title}</h1>
        <h2 className="event-item-price">
          ${props.event.price} -
          {new Date(props.event.date).toLocaleDateString()}
        </h2>
      </div>
      <div>
        {props.authUserId !== props.event.creator._id ? (
          <button
            className="btn"
            onClick={() => props.onDetail(props.event._id)}
          >
            View Details
          </button>
        ) : (
          <p className="event-owner">You are the owner of this event</p>
        )}
      </div>
    </li>
  );
};

export default EventItem;
