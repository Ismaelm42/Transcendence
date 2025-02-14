// Import Fastify
const path = require('path');
require('dotenv').config();
const fastify = require('fastify')();
const fastifyStatic = require('@fastify/static');
const fastifyCors = require('@fastify/cors');
const fastifySecureSession = require('@fastify/secure-session');
const fastifyPassport = require('@fastify/passport');
const { default: fastifyCookie } = require('@fastify/cookie');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Register Fastify Secure Session
fastify.register(fastifySecureSession, {
  secret: process.env.SESSION_SECRET,
  cookie: {
    path: '/'
  }
})

// Initialize Fastify Passport
fastify.register(fastifyPassport.initialize());
fastify.register(fastifyPassport.secureSession());

// Use Google Strategy
fastifyPassport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://localhost/back/auth/google/login"
}, function(accessToken, refreshToken, profile, cb) {
  // We should store the user profile in the database
  cb(null, profile);
}));

// Register CORS and allow only requests from http://frontend:3000
fastify.register(fastifyCors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ['Content-Type'],
});

// Define a route to handle the login
fastify.get('/auth/google/login',{
  preValidation: fastifyPassport.authenticate('google', { scope: ['profile'] }) },
  async (request, reply) => {
    reply.redirect('/back');
  }
)

// Define a serializer
fastifyPassport.registerUserSerializer(async (user, request) => {
  return user;
})

// Define a deserializer
fastifyPassport.registerUserDeserializer(async (user, request) => {
  return user;
})

// Define a route to handle POST requests
fastify.post('/api/data', async (request, reply) => {
  console.log('Received data:', request.body);
  return { data_received: request.body };
});

// Define a route for /
fastify.get('/', async (request, reply) => {
  if (request.user && request.user.displayName)
    return reply.send(`Welcome ${request.user.displayName}`);
  else
    return reply.send('Welcome stranger');
});

// Define a route for logout
fastify.get('/auth/google/logout', async (request, reply) => {
  request.logout();
  reply.redirect('/back');
})

// Initialize Server
const start = async () => {
  try {
    // Listenning in port 8000
    await fastify.listen({ port: 8000, host: '0.0.0.0' });
    console.log('Server listenning on http://backend:8000');
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

// Call the function to start server
start();
