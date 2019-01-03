const User = require("../../models/user.js");
const bcrypt = require("bcryptjs");

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
  }
};
