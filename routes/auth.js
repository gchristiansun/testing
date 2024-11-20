const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const path = require("path"); // Dibutuhkan untuk mengakses file
const router = express.Router();

// Middleware untuk memastikan user telah login
function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    return res.redirect("/auth/login");
  }
}

// Impor data GeoJSON jika diperlukan
const lines = require("../public/line"); // Pastikan path sesuai dengan lokasi file line.js

// Render halaman login
router.get("/login", (req, res) => {
  res.render("login");
});

// Proses login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM user WHERE username = ?";
  db.query(query, [username], (err, results) => {
    if (err) return res.status(500).send("Internal server error");
    if (results.length > 0) {
      const user = results[0];

      // Bandingkan password
      if (bcrypt.compareSync(password, user.password)) {
        req.session.user = user;
        return res.redirect("/auth/index"); // Arahkan ke halaman utama
      } else {
        return res.render("login", { error: "Password salah" });
      }
    } else {
      return res.render("login", { error: "Pengguna tidak ditemukan" });
    }
  });
});

// Render halaman register
router.get("/register", (req, res) => {
  res.render("register");
});

// Proses registrasi
router.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  const hashedPassword = bcrypt.hashSync(password, 10);
  const query = "INSERT INTO user (username, email, password) VALUES (?, ?, ?)";

  db.query(query, [username, email, hashedPassword], (err, result) => {
    if (err) return res.status(500).send("Registrasi gagal");
    res.redirect("/auth/login");
  });
});

// Render halaman utama
router.get("/index", ensureAuthenticated, (req, res) => {
  res.render("index", { user: req.session.user });
});

// Rute Beranda
router.get("/beranda", ensureAuthenticated, (req, res) => {
  res.render("beranda"); // Render file beranda.ejs
});

// Render halaman peta
router.get("/peta", ensureAuthenticated, (req, res) => {
  res.render("peta"); // Render file peta.ejs
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Logout gagal");
    res.redirect("/auth/login");
  });
});

module.exports = router;
