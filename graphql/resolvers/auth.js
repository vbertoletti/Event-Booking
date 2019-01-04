const User = require("../../models/user.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = {
  //To create a user, first I need to check if the provided email address already exists. Have to 'return' in order for graphql to wait until promise is complete, async.
  createUser: async args => {
    try {
      const existingUser = await User.findOne({ email: args.userInput.email });

      if (existingUser) {
        throw new Error("User already exists.");
      }
      //first arg is what I want to hash and second is how many rounds of salting.
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

      const user = new User({
        email: args.userInput.email,
        password: hashedPassword
      });
      const result = await user.save();
      return { ...result._doc, password: null, _id: result.id };
      // setting password to null so it cannot be retrieved from graphql, even though it's hashed.
    } catch (err) {
      throw err;
    }
  },

  login: async ({ email, password }) => {
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("User does not exist");
    }
    //compares the string password to the hashed DB password
    const isEqual = bcrypt.compare(password, user.password);
    if (!isEqual) {
      throw new Error("Password is incorrect");
    }
    //1st arg is what I want to store in the token, 2nd is required, a string to hash the token like a private key, 3rd expiration time (optional)
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      "somesupersecretkey",
      { expiresIn: "1h" }
    );
    return { userId: user.id, token: token, tokenExpiration: 1 };
  }
};
