const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const Event = require("./models/event.js");
const User = require("./models/user.js");
const bcrypt = require("bcryptjs");

const app = express();

app.use(bodyParser.json());

const events = eventIds => {
  return Event.find({ _id: { $in: eventIds } })
    .then(events => {
      return events.map(event => {
        return {
          ...event._doc,
          _id: event.id,
          creator: user.bind(this, event.creator)
        };
      });
    })
    .catch(err => {
      throw err;
    });
};

//.populate('creator') is a method provided by mongoose that populates any relations that it knows, so for example GraphQL returns the email from the user. However it can be replaced by the following function:
const user = userId => {
  return User.findById(userId)
    .then(user => {
      return {
        ...user._doc,
        _id: user.id,
        createdEvents: events.bind(this, user._doc.createdEvents)
      };
    })
    .catch(err => {
      throw err;
    });
};

app.use(
  "/graphql",
  graphqlHttp({
    schema: buildSchema(`
      type Event {
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
        creator: User!
      }

      type User {
        _id: ID!
        email: String!
        password: String
        createdEvents: [Event!]
      }

      input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!

      }

      input UserInput {
        email: String!
        password: String!
      }

      type RootQuery {
        events: [Event!]!
      }

      type RootMutation {
        createEvent(eventInput: EventInput): Event
        createUser(userInput: UserInput): User
      }
      schema {
          query: RootQuery
          mutation: RootMutation
      }
    `),
    //resolvers
    rootValue: {
      events: () => {
        return Event.find()
          .then(events => {
            return events.map(event => {
              //I need to transform the _id into a string to solve graphql error. Mongoose allows me to use only event.id - this also works fine.
              return {
                ...event._doc,
                _id: event._doc._id.toString(),
                creator: user.bind(this, event._doc.creator)
              };
            });
          })
          .catch(err => {
            throw err;
          });
      },

      //this will take in the args passed when creating the schema.
      createEvent: args => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date),
          //mongoose will store automatically an objectId, only need to pass in a string:
          creator: "5c2c0a11d91ce34987f3de40"
        });
        let createdEvent;
        //save method is provided by mongoose
        return event
          .save()
          .then(result => {
            //_doc is provided by mongoose, it leaves out meta data
            createdEvent = { ...result._doc, _id: result._doc._id.toString() };
            return User.findById("5c2c0a11d91ce34987f3de40");
          })
          .then(user => {
            if (!user) {
              throw new Error("User not found.");
            }
            //I need to pass in the id, however I can pass the entire event object and mongoose will handle the id.
            user.createdEvents.push(event);
            //this will update the user in the DB:
            return user.save();
          })
          .then(result => {
            return createdEvent;
          })
          .catch(err => {
            console.log(err);
            throw err;
          });
      },
      //To create a user, first I need to check if the provided email address already exists. Have to 'return' in order for graphql to wait until promise is complete, async.
      createUser: args => {
        return User.findOne({ email: args.userInput.email })
          .then(user => {
            if (user) {
              throw new Error("User already exists.");
            }
            //first arg is what I want to hash and second is how many rounds of salting.
            return bcrypt.hash(args.userInput.password, 12);
          })
          .then(hashedPassword => {
            const user = new User({
              email: args.userInput.email,
              password: hashedPassword
            });
            return user.save();
          })
          .then(result => {
            return { ...result._doc, password: null, _id: result.id };
            // setting password to null so it cannot be retrieved from graphql, even though it's hashed.
          })
          .catch(err => {
            throw err;
          });
      }
    },
    //graphql playground
    graphiql: true
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${
      process.env.MONGO_PASSWORD
    }@cluster0-uagfb.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`
  )
  .then(() => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
