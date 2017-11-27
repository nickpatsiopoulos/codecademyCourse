const morgan = require("morgan");
const bodyParser = require("body-parser");
const errorhandler = require("errorhandler");
const cors = require("cors");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 4000;


module.exports = app;


app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cors());
app.use(errorhandler());


const apisRouter = require('./api/api.js');
app.use('/api/', apisRouter);


app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
