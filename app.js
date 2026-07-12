require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const ejsMate = require("ejs-mate");
const pageRoutes = require("./routes/pageRoutes");
const simplifyRoutes = require("./routes/simplifyRoutes");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", pageRoutes);
app.use("/api", simplifyRoutes);

app.use("/ping", (req,res) =>{
  res.send("ping");
})

// ── 404 — Catch-all for unmatched routes ──────────────────
app.use(function (req, res, next) {
  res.status(404).render("pages/error.ejs");
});

// ── 500 — Global error handler ───────────────────────────
app.use(function (err, req, res, next) {
  console.error("[EduSimplify Error]", err.stack || err.message || err);
  res.status(err.status || 500).render("pages/error.ejs");
});

// ── Server ───────────────────────────────────────────────
app.listen(9500, () => {
  console.log("App is listening on port 9500");
});
