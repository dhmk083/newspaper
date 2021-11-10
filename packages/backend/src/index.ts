import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import puppeteer from "puppeteer";
import createApi from "./api";

dotenv.config();

const server = express();
server.use(cors({ origin: "http://localhost:3000", credentials: true }));
server.use(cookieParser());
server.use(express.json());

server.use((req, res, next) => {
  // log
  res.once("finish", () => console.log(req.method, req.url, res.statusCode));

  // delay
  setTimeout(next, Math.floor(Math.random() * 1000));
});

const STATIC_DIR = "../frontend/build";

server.use(express.static(STATIC_DIR, { index: false }));

server.use("/api", createApi({ jwtSecret: process.env.JWT_SECRET }));

// hack for puppeteer
declare var window, document;

// simple universal SSR (todo: make it useful)
server.get("/*", async (req, res) => {
  if (req.query.ssr) return express.static(STATIC_DIR)(req, res, () => {});

  const url = `${req.protocol}://${req.headers.host}/?ssr=1`;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle0" });
  await page.$eval("head", (el: any) => {
    const ssr = document.createElement("script");
    ssr.innerText = `window.SSR = ${window.getSSR()}`;
    el.prepend(ssr);
  });
  const html = await page.content();
  await browser.close();

  res.send(html);
});

server.listen(3002, () => console.log("server ready!"));
