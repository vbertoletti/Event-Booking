const { dateToString } = require("../../helpers/date.js");
const Event = require("../../models/event.js");
const User = require("../../models/user.js");
const { transformEvent } = require("./merge");

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      return events.map(event => {
        //I need to transform the _id into a string to solve graphql error. Mongoose allows me to use only event.id - this also works fine.
        return transformEvent(event);
      });
    } catch (err) {
      throw err;
    }
  },

  //this will take in the args passed when creating the schema.
  createEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("User is not authorized to create event");
    }

    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: dateToString(args.eventInput.date),
      //mongoose will store automatically an objectId, only need to pass in a string:
      creator: req.userId
    });

    let createdEvent;

    try {
      //save method is provided by mongoose
      const result = await event.save();
      //_doc is provided by mongoose, it leaves out meta data
      createdEvent = transformEvent(result);
      const creator = await User.findById(req.userId);

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
  }
};
