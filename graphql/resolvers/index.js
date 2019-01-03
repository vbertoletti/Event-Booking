const Event = require("../../models/event.js");
const User = require("../../models/user.js");
const bcrypt = require("bcryptjs");

const events = async eventIds => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    events.map(event => {
      return {
        ...event._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event.creator)
      };
    });
    return events;
  } catch (err) {
    throw err;
  }
};

//.populate('creator') is a method provided by mongoose that populates any relations that it knows, so for example GraphQL returns the email from the user. However it can be replaced by the following function:
const user = async userId => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      _id: user.id,
      createdEvents: events.bind(this, user._doc.createdEvents)
    };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      return events.map(event => {
        //I need to transform the _id into a string to solve graphql error. Mongoose allows me to use only event.id - this also works fine.
        return {
          ...event._doc,
          _id: event._doc._id.toString(),
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, event._doc.creator)
        };
      });
    } catch (err) {
      throw err;
    }
  },

  //this will take in the args passed when creating the schema.
  createEvent: async args => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      //mongoose will store automatically an objectId, only need to pass in a string:
      creator: "5c2c0a11d91ce34987f3de40"
    });

    let createdEvent;

    try {
      //save method is provided by mongoose
      const result = await event.save();
      //_doc is provided by mongoose, it leaves out meta data
      createdEvent = {
        ...result._doc,
        _id: result._doc._id.toString(),
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, result._doc.creator)
      };
      const creator = await User.findById("5c2c0a11d91ce34987f3de40");

      if (!creator) {
        throw new Error("User not found.");
      }
      //I need to pass in the id, however I can pass the entire event object and mongoose will handle the id.
      creator.createdEvents.push(event);
      //this will update the user in the DB:
      await creator.save();

      return createdEvent;
    } catch (err) {
      throw err;
    }
  },
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
