const express = require('express');
const app = express();
const db = require('./db');
require('dotenv').config();

const bodyParser = require('body-parser');
app.use(bodyParser.json()); //req body
const PORT = process.env.PORT || 4000;

// Import the router files
const userRoutes = require('./routes/userRoutes')
const candidateRoutes = require('./routes/candidatesRoutes')

// use the routers
app.use('/user',userRoutes);
app.use('/candidate', candidateRoutes);

app.listen(PORT, () => {
    console.log('listening on port 4000');
})