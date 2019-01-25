import React from "react";
import EventItem from "./EventItem/EventItem";
import "./EventList.css";

const EventList = props => {
  const events = props.events.map(event => {
    return (
      <EventItem
        key={event._id}
        event={event}
        authUserId={props.authUserId}
        onDetail={props.onViewDetails}
      />
    );
  });

  return <ul className="events-list">{events}</ul>;
};

export default EventList;
