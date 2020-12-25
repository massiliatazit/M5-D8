const express = require("express");
const cors = require("cors");
const listEndpoints = require("express-list-endpoints");
const {
  notFoundHandler,
  unauthorizedHandler,
  forbiddenHandler,
  badRequestHandler,
  catchAllHandler,
} = require("./errorHandling");
const attendeesRoute = require("./services/attendees");

const server = express();
const port = process.env.PORT || 5001;
whitelist = [];
server.use(cors({}));
server.use(express.json()); //to understand what we have inside body otherwise it will be undefined.
server.use("/attendees", attendeesRoute); // has to be after json(the body) and after cors(frontend) otherwise it'll be undefined
server.use(badRequestHandler); // error has to be after the route because it comes on next (in middlewares errors handling)
server.use(notFoundHandler);
server.use(catchAllHandler);
server.use(forbiddenHandler);
server.use(unauthorizedHandler);

console.log(listEndpoints(server));

server.listen(port, () => {
  if (process.env.NODE_ENV === "production") {
    console.log(`server is listening IN CLOUD port ${port}`);
  } else {
    console.log(`server is listening LOCALLY  port ${port}`);
  }
});
