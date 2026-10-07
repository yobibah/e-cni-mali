const { Redis } = require("ioredis");

const connection = new Redis({
   host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest:null
});

connection.on("connect", () => console.log("Redis connecté"));
connection.on("error", (err) => console.error("Redis erreur :", err));

module.exports = connection;