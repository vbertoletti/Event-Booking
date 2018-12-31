const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql");
const { buildSchema } = require("graphql");

const app = express();

app.use(bodyParser.json());

app.use(
  "/graphql",
  graphqlHttp({
    schema: buildSchema(`

      type RootQuery {
        events: [String!]!
      }

      type RootMutation {
        createEvent(name: String): String
      }
      schema {
          query: RootQuery
          mutation: RootMutation
      }
    `),
    //resolvers
    rootValue: {
      events: () => {
        return ["Event 1", "Event 2", "Event 3"];
      },

      //this will take in the args passed when creating the schema. Example, takes in name.
      createEvent: args => {
        const eventName = args.name;
        return eventName;
      }
    },
    //graphql playground
    graphiql: true
  })
);

app.listen(3000);
