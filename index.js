const express = require("express"),
  fs = require("fs"),
  cors = require("cors"),
  path = require("path");

const app = express(),
  PORT = 3500;
  
const {router, staticSite} = require("./routes/router");

// middlewares
app.use((req, res, next) => {
  next();
})
app.use(cors());
app.use(express.json());
app.use('/api', router);
app.use('/sched', staticSite);
app.use(express.static(path.join(__dirname, "public")));

app.get('^/$|/index(.html)?', (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}.`);
})