// Example express application adding the parse-server module to expose Parse
// compatible API routes.

const express = require('express');
const ParseServer = require('parse-server').ParseServer;
const path = require('path');
const args = process.argv || [];
const test = args.some(arg => arg.includes('jasmine'));

const databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}
const config = {
  databaseURI: databaseUri || 'mongodb://localhost:27017/tabletDEV',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/tablet/main.js',
  appId: process.env.APP_ID || 'tabletAppId',
  masterKey: process.env.MASTER_KEY || 'pass', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse', // Don't forget to change to https if needed
  liveQuery: {
    classNames: ['Posts', 'Comments'], // List of classes to support for query subscriptions
  },
};

const watchConfig = {
  databaseURI: databaseUri || 'mongodb://localhost:27017/watchDEV',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/watch/main.js',
  appId: process.env.APP_ID || 'watchAppId',
  masterKey: process.env.MASTER_KEY || 'pass', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse', // Don't forget to change to https if needed
  liveQuery: {
    classNames: ['Posts', 'Comments'], // List of classes to support for query subscriptions
  },
};

const app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
const mountPath = process.env.PARSE_MOUNT || '/parse';
if (!test) {
  const api = new ParseServer(config);
  app.use(mountPath, api);
  const watchApi = new ParseServer(watchConfig);
  app.use(mountPath, watchApi);
}

// Parse Server plays nicely with the rest of your web routes
app.get('/', function (req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// Serve Parse Dashboard
const ParseDashboard = require('parse-dashboard');
const dashboard = new ParseDashboard({
  apps: [
    {
      appId: process.env.APP_ID || 'myAppId',
      serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse', // Don't forget to change to https if needed
      masterKey: process.env.MASTER_KEY || 'pass', //Add your master key here. Keep it secret!
      appName: 'Tablet Test',
    },
    {
      appId: process.env.APP_ID || 'watchAppId',
      serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse', // Don't forget to change to https if needed
      masterKey: process.env.MASTER_KEY || 'pass', //Add your master key here. Keep it secret!
      appName: 'Watch Test',
    },
  ],
});

app.use('/dashboard', dashboard);

const port = process.env.PORT || 1337;
if (!test) {
  const httpServer = require('http').createServer(app);
  httpServer.listen(port, function () {
    console.log('parse-server-example running on port ' + port + '.');
  });
  // This will enable the Live Query real-time server
  ParseServer.createLiveQueryServer(httpServer);
}

module.exports = {
  app,
  config,
};
