import mongoose from "mongoose";
import { config } from "../config";
import { MajsoulConfig } from "../db/MajsoulConfig";
import { main } from "../api/majsoul/data/connector";

const myDate = new Date();
const dateStr = "2024-12-31T23:59";
console.log(
  `Current date: ${new Date(dateStr).toISOString()} vs ${myDate.toISOString()}`
);

// .then(async () => {
//   const dbConfigs = await MajsoulConfig.find();
//   if (dbConfigs.length === 0) {
//     MajsoulConfig.insertOne({
//       passportToken: "",
//       userAgent: "",
//       loginCookies: [],
//     }).then((value) => {
//       console.log(`added:\n${JSON.stringify(value)}`);
//     });
//   }

//   main();
// });
