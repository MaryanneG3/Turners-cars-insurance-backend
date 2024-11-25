// imports
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const fs = require("fs");
require("dotenv").config();

// init Router
const apiRouter = express.Router();

// init server
const app = express();

// middleware
app.use(cors());

// coonection pool to db
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: 3306,
  ssl: { ca: fs.readFileSync("./DigiCertGlobalRootCA.crt.pem") },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// =============== Endpoints =============== //

app.get("/", (req, res) => {
  console.log("/ endpoint was hit");

  pool.query("SELECT * FROM annual_insurance_premium", (error, results) => {
    if (error) {
      console.error(`Error fetching data from database: ${error}`);
      return res.status(500).send(`Internal Server Error`);
    }
    res.json(results);
  });
});

app.get("/:category", (req, res) => {
  console.log(`Category endpoint hit. yayyyy`);
  const vehicleCategory = req.params.category;

  pool.query(
    "SELECT * FROM annual_insurance_premium WHERE category = ?",
    [vehicleCategory],
    (error, results) => {
      if (error) {
        console.error(`Error fetching category data from database: ${error}`);
        console.log(vehicleCategory);
        return res.status(500).send("Internal Server Error");
      }
      res.json(results);
    }
  );
});

const PORT = process.env.NODE_APP_PORT || 4000;

app
  .listen(PORT, () => {
    console.log(`Server is live at http://localhost:${PORT}`);
  })
  .on("error", (error) => {
    if (error.code === "EADDRRINUSE") {
      console.error("Port in use");
    } else {
      console.error("Server error: ", error);
    }
  });
