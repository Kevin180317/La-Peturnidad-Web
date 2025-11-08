const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mysql2 = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "peturnidad",
  port: 3306,
};

mysql2
  .createConnection(dbConfig)
  .then((connection) => {
    console.log("Database connected successfully.");
    connection.end();
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });

const transporter = nodemailer.createTransport({
  host: "prometheustij.com",
  port: 465,
  secure: true,
  auth: {
    user: "contact@prometheustij.com",
    pass: "GoJo1991@!",
  },
});

app.post("/send-email", async (req, res) => {
  const { name, company, telephone, email, message } = req.body;

  if (
    !name ||
    !email ||
    !message ||
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string" ||
    (telephone && typeof telephone !== "string")
  ) {
    return res
      .status(400)
      .json({ error: "Missing or invalid required fields." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  try {
    const connection = await mysql2.createConnection(dbConfig);
    await connection.execute(
      "INSERT INTO mensajes (name, company, telephone, email, message) VALUES (?, ?, ?, ?, ?)",
      [name, company || "", telephone || "", email, message]
    );
    await connection.end();
  } catch (dbError) {
    console.error("Error saving to database:", dbError);
    return res.status(500).json({ error: "Error saving to database." });
  }

  try {
    await transporter.sendMail({
      from: "La Peturnidad <contact@prometheustij.com>",
      to: email,
      subject: `New Contact Form Submission from ${name}`,
      text:
        `Name: ${name}\n` +
        `Company: ${company}\n` +
        `Telephone: ${telephone}\n` +
        `Email: ${email}\n` +
        `Message: ${message}\n`,
    });
    res.status(200).send("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Error sending email");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
