const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');

const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

const app = express();

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(cors({ origin: '*' })); // For FCC testing purposes only

app.use(helmet.xssFilter());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sample front-end
app.route('/:project/').get(function(req, res) {
  res.sendFile(`${process.cwd()}/views/issue.html`);
});

// Index page (static HTML)
app.route('/').get(function(req, res) {
  res.sendFile(`${process.cwd()}/views/index.html`);
});

// For FCC testing purposes
fccTestingRoutes(app);

// Routing for API
apiRoutes(app);

// 404 Not Found Middleware
app.use(function(req, res) {
  res.status(404).send('Not Found');
});

require('dotenv').config();

mongoose.set('useFindAndModify', false);
mongoose.connect(
  process.env.DB,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err, client) => {
    if (!err) console.log('Database connected!');
    // Start our server and tests!
    const port = process.env.PORT || 3000;
    app.listen(port, function() {
      console.log(`Listening on port ${port}`);
      if (process.env.NODE_ENV === 'test') {
        console.log('Running Tests...');
        setTimeout(function() {
          try {
            runner.run();
          } catch (e) {
            const error = e;
            console.log('Tests are not valid:');
            console.log(error);
          }
        }, 1000);
      }
    });
  }
);
module.exports = app; // for testing
