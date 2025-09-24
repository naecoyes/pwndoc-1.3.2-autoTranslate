// Set environment variables if not already set
if (!process.env.DB_SERVER) process.env.DB_SERVER = 'localhost';
if (!process.env.DB_PORT_HOST) process.env.DB_PORT_HOST = '27017';
if (!process.env.DB_NAME) process.env.DB_NAME = 'pwndoc';

var fs = require('fs');
var app = require('express')();

// Use HTTP server for development
var http = require('http').Server(app);

// Uncomment below for HTTPS in production
/*
var https = require('https').Server({
  key: fs.readFileSync(__dirname+'/../ssl/server.key'),
  cert: fs.readFileSync(__dirname+'/../ssl/server.cert'),
	maxVersion: 'TLSv1.3',
	minVersion: 'TLSv1.2',
	ciphers: 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384',
	honorCipherOrder: false
}, app);
*/
app.disable('x-powered-by');

var io = require('socket.io')(http, {
  cors: {
    origin: "*"
  }
})
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
var utils = require('./lib/utils');

// Get configuration
global.__basedir = __dirname;

// Database connection setup (will connect later)
var mongoose = require('mongoose');
// Use native promises
mongoose.Promise = global.Promise;
// Trim all Strings
mongoose.Schema.Types.String.set('trim', true);

// MongoDB connection function
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log(`Connection string: mongodb://${process.env.DB_SERVER}:${process.env.DB_PORT_HOST}/${process.env.DB_NAME}`);
    
    await mongoose.connect(`mongodb://${process.env.DB_SERVER}:${process.env.DB_PORT_HOST}/${process.env.DB_NAME}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      connectTimeoutMS: 30000,
      family: 4
    });
    
    console.log('MongoDB connected successfully');
     
     // Load models after successful connection
     require('./models/user');
     require('./models/audit');
     require('./models/client');
     require('./models/company');
     require('./models/template');
     require('./models/vulnerability');
     require('./models/vulnerability-update');
     require('./models/language');
     require('./models/audit-type');
     require('./models/vulnerability-type');
     require('./models/vulnerability-category');
     require('./models/custom-section');
     require('./models/custom-field');
     require('./models/image');
     require('./models/settings');
      
      // Initialize routes after models are loaded
      require('./routes/user')(app);
      require('./routes/audit')(app, io);
      require('./routes/client')(app);
      require('./routes/company')(app);
      require('./routes/vulnerability')(app);
      require('./routes/template')(app);
      require('./routes/vulnerability')(app);
      require('./routes/data')(app);
      require('./routes/image')(app);
      require('./routes/settings')(app);
      require('./routes/backup')(app);
      require('./routes/ai')(app);
      
    } catch (error) {
      console.error('MongoDB connection failed:', error.message);
      console.log('Server will continue without database connection');
    }
  };

// MongoDB connection event handlers
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during graceful shutdown:', err);
    process.exit(1);
  }
});

// Models will be loaded after database connection

// Socket IO configuration
io.on('connection', (socket) => {
  socket.on('join', (data) => {
    console.log(`user ${data.username.replace(/\n|\r/g, "")} joined room ${data.room.replace(/\n|\r/g, "")}`)
    socket.username = data.username;
    do { socket.color = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6); } while (socket.color === "#77c84e")
    socket.join(data.room);
    io.to(data.room).emit('updateUsers');
  });
  socket.on('leave', (data) => {
    console.log(`user ${data.username.replace(/\n|\r/g, "")} left room ${data.room.replace(/\n|\r/g, "")}`)
    socket.leave(data.room)
    io.to(data.room).emit('updateUsers');
  })
  socket.on('updateUsers', (data) => {
    var userList = [...new Set(utils.getSockets(io, data.room).map(s => {
      var user = {};
      user.username = s.username;
      user.color = s.color;
      user.menu = s.menu;
      if (s.finding) user.finding = s.finding;
      if (s.section) user.section = s.section;
      return user;
    }))];
    io.to(data.room).emit('roomUsers', userList);
  })
  socket.on('menu', (data) => {
    socket.menu = data.menu;
    (data.finding)? socket.finding = data.finding: delete socket.finding;
    (data.section)? socket.section = data.section: delete socket.section;
    io.to(data.room).emit('updateUsers');
  })
  socket.on('disconnect', () => {
    socket.broadcast.emit('updateUsers')
  })
});

// CORS
app.use(function(req, res, next) {
  // res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Expose-Headers', 'Content-Disposition')
  // res.header('Access-Control-Allow-Credentials', 'true')
  next();
});

// CSP
app.use(function(req, res, next) {
  res.header("Content-Security-Policy", "default-src 'none'; form-action 'none'; base-uri 'self'; frame-ancestors 'none'; sandbox; require-trusted-types-for 'script';");
  next();
});

app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({
  limit: '10mb',
  extended: false // do not need to take care about images, videos -> false: only strings
}));

app.use(cookieParser())

// Routes will be initialized after database connection

app.all(/(.*)/, function(req, res) {
    res.status(404).json({"status": "error", "data": "Route undefined"});
})

// Global error handler
app.use((err, req, res, next) => {
  // Log error details for debugging
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Don't expose internal error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      details: isDevelopment ? err.message : 'Invalid input data'
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid ID format',
      details: isDevelopment ? err.message : 'Invalid resource identifier'
    });
  }
  
  if (err.code === 11000) {
    return res.status(409).json({
      status: 'error',
      message: 'Duplicate entry',
      details: isDevelopment ? err.message : 'Resource already exists'
    });
  }

  // Default error response
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    details: isDevelopment ? err.message : 'Something went wrong. Please contact your administrator.'
  });
})

// Start server and connect to database

// Connect to MongoDB first
connectDB();

http.listen(4242)
console.log('Server running on http://localhost:4242');

module.exports = app;
