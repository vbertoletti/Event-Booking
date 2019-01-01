const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const Event = require("./models/event.js");

const app = express();

app.use(bodyParser.json());

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
      }

      input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!

      }

      type RootQuery {
        events: [Event!]!
      }

      type RootMutation {
        createEvent(eventInput: EventInput): Event
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
              return { ...event._doc, _id: event._doc._id.toString() };
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
          date: new Date(args.eventInput.date)
        });
        //save method is provided by mongoose
        return event
          .save()
          .then(result => {
            console.log(result);
            //_doc is provided by mongoose, it leaves out meta data
            return { ...result._doc, _id: result._doc._id.toString() };
          })
          .catch(err => {
            console.log(err);
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
