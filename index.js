const express = require("express");
const port = 5000;
const app = express();
const cors = require("cors");
const connectdb = require("./config/mongoose");
const userRouted = require("./routes/user-route");
const swaggerjsdoc = require('swagger-jsdoc');
const swaggerui = require('swagger-ui-express');

const options = {
  definition:{
    openapi:'3.0.0',
    info : {
      title: "voosh api assignment",
      version: '1.0.0'
    },
    servers : [{
      url: "http://localhost:5000/user/ "
    }]
  },
  apis : ['./controllers/user-controller.js']
}

const swaggerspec = swaggerjsdoc(options);
app.use('/api-docs', swaggerui.serve, swaggerui.setup(swaggerspec)); 


app.use(cors());

app.use(express.json());

app.use("/user/", userRouted);

app.listen(port, () => {
  console.log(`server is listening on ${port}`);
});