import React, { Component } from "react";
import AuthContext from "../context/auth-context";
import Spinner from "../components/Spinner/Spinner";
import BookingList from "../components/Bookings/BookingList/BookingList";
import BookingsChart from "../components/Bookings/BookingsChart/BookingsChart";
import BookingsControl from "../components/Bookings/BookingsControl/BookingsControl";

class BookingsPage extends Component {
  state = {
    isLoading: false,
    bookings: [],
    outputType: "list"
  };

  static contextType = AuthContext;

  componentDidMount() {
    this.fetchBookings();
  }

  fetchBookings = () => {
    this.setState({ isLoading: true });
    const requestBody = {
      query: `query {
        bookings {
          _id
          createdAt
          event {
            _id
            title
            date
            price
          }
        }
      }`
    };

    fetch("http://localhost:8000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.context.token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed");
        }
        //this will automatically extract and parse the res body
        return res.json();
      })
      .then(resData => {
        const bookings = resData.data.bookings;
        this.setState({ bookings: bookings, isLoading: false });
      })
      .catch(err => {
        console.log(err);
        this.setState({ isLoading: false });
      });
  };

  deleteBookingHandler = bookingId => {
    this.setState({ isLoading: true });
    const requestBody = {
      query: `mutation {
        cancelBooking(bookingId: "${bookingId}") {
          _id
          title
        }
      }`
    };

    fetch("http://localhost:8000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.context.token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed");
        }
        //this will automatically extract and parse the res body
        return res.json();
      })
      .then(resData => {
        this.setState(prevState => {
          const updatedBooking = prevState.bookings.filter(booking => {
            return booking._id !== bookingId;
          });
          return { bookings: updatedBooking, isLoading: false };
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({ isLoading: false });
      });
  };

  ChangeOutputTypeHandler = outputType => {
    outputType === "list"
      ? this.setState({ outputType: "list" })
      : this.setState({ outputType: "chart" });
  };
  render() {
    let content = <Spinner />;
    if (!this.state.isLoading) {
      content = (
        <React.Fragment>
          <BookingsControl
            activeOutputType={this.state.outputType}
            onChange={this.ChangeOutputTypeHandler}
          />
          <div>
            {this.state.outputType === "list" ? (
              <BookingList
                bookings={this.state.bookings}
                onDelete={this.deleteBookingHandler}
              />
            ) : (
              <BookingsChart bookings={this.state.bookings} />
            )}
          </div>
        </React.Fragment>
      );
    }
    return <React.Fragment>{content}</React.Fragment>;
  }
}

export default BookingsPage;
