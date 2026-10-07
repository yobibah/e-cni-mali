require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
const demandeur = require("./routes/demandeur.route");
const paiement = require("./routes/paiement.route");
const centre = require("./routes/centres.route");
const agent = require("./routes/agent.route");
const admin = require("./routes/admin.route");
const connection = require("./config/redis");
const app = express();
const PORT = process.env.PORT || 3000;
const cron = require("node-cron");
const tasks = require("./tasks/demande.cron");
const task = new tasks();
const initSocket = require("./sockets/index");

const server = http.createServer(app);

initSocket(server);

// middlewares
app.use(express.json());
const corsOptions = {
  origin: ["https://e-oni-bf.duckdns.org","http://localhost:5173"],
  optionsSuccessStatus: 200,
};
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan("combined"));

app.use("/api/demandeur", demandeur);
app.use("/api/centres", centre);
app.use("/api/paiement", paiement);
app.use("/api/agent", agent);
app.use("/api/admin", admin);
// Routes
// app.use('/api/admin', require('./routes/admin.routes'));

cron.schedule("* * * * *", () => {
  task.delDemandeNotFinish();
  // marquer d'abord les notifications envoyer  ensuite recuperer les notifications non envoyer

  // task.SendSmsToUser();
  console.log(
    "Cron job running every minute at",
    new Date().toLocaleTimeString(),
  );
});

app.get("/", (req, res) => {
  res.json({ message: "API ONI opérationnelle" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(` Serveur démarré sur le port ${PORT}`);
});

module.exports =app;

// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");
// const helmet = require("helmet");
// const morgan = require("morgan");
// const http = require("http");
// const { Server } = require("socket.io");

// const demandeur = require("./routes/demandeur.route");
// const paiement = require("./routes/paiement.route");
// const centre = require("./routes/centres.route");
// const agent = require("./routes/agent.route");
// const admin = require("./routes/admin.route");

// const app = express();

// const PORT = process.env.PORT || 3000;

// // middlewares
// app.use(express.json());

// const corsOptions = {
//   origin: ["https://e-oni-bf.duckdns.org"],
//   optionsSuccessStatus: 200,
// };

// app.use(express.urlencoded({ extended: true }));
// app.use(cors(corsOptions));
// app.use(helmet());
// app.use(morgan("combined"));

// // routes
// app.use("/api/demandeur", demandeur);
// app.use("/api/centres", centre);
// app.use("/api/paiement", paiement);
// app.use("/api/agent", agent);
// app.use("/api/admin", admin);

// app.get("/", (req, res) => {
//   res.json({
//     message: "API ONI opérationnelle",
//   });
// });

// // Démarrage uniquement hors tests
// if (process.env.NODE_ENV !== "test") {
//   const server = http.createServer(app);

//   const initSocket = require("./sockets/index");
//   initSocket(server);

//   const cron = require("node-cron");
//   const Tasks = require("./tasks/demande.cron");

//   const task = new Tasks();

//   cron.schedule("* * * * *", () => {
//     task.delDemandeNotFinish();

//     console.log(
//       "Cron job running every minute at",
//       new Date().toLocaleTimeString()
//     );
//   });

//   server.listen(PORT, "0.0.0.0", () => {
//     console.log(`Serveur démarré sur le port ${PORT}`);
//   });
// }

// module.exports = app;