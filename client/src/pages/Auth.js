import React, { Component } from "react";
import "./Auth.css";

class AuthPage extends Component {
  constructor(props) {
    super(props);
    this.emailElement = React.createRef();
    this.passwordElement = React.createRef();
  }
  handleSubmit = event => {
    event.preventDefault();

    const email = this.emailElement.current.value;
    const password = this.passwordElement.current.value;

    //trim() removes whitespace from both sides of a str
    if (email.trim().length === 0 || password.trim().length === 0) {
      return;
    }

    const requestBody = {
      query: `mutation {
        createUser(userInput: {email: "${email}", password: "${password}"}) {
          _id
          email
        }
      }`
    };

    fetch("http://localhost:8000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json"
      }
    });
  };

  render() {
    return (
      <form className="auth-form" onSubmit={this.handleSubmit}>
        <div className="form-control">
          <label htmlFor="email">E-mail</label>
          <input type="email" id="email" ref={this.emailElement} />
        </div>

        <div className="form-control">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" ref={this.passwordElement} />
        </div>
        <div className="form-actions">
          <button type="submit">Submit</button>
          <button type="button">Switch to Signup</button>
        </div>
      </form>
    );
  }
}

export default AuthPage;
