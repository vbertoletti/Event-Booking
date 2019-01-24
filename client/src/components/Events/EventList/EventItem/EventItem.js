import React from "react";
import "./EventItem.css";

const EventItem = props => {
  return (
    <li key={props._id} className="events-list-item">
      <div>
        <h1 className="event-item-title">{props.title}</h1>
        <h2 className="event-item-price">$19.99</h2>
      </div>
      <div>
        {props.userId === props.creatorId ? (
          <button className="btn">View Details</button>
        ) : (
          <p className="event-owner">You are the owner of this event</p>
        )}
      </div>
    </li>
  );
};

export default EventItem;
