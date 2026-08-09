import fs from "node:fs"
import { parseGunsInternationalHTML } from "./scrapers/gunsinternational.mjs"
import { parseGunsComHTML } from "./scrapers/gunscom.mjs"

const html = await (await fetch("https://web.archive.org/web/2026/https://www.gunsinternational.com/guns-for-sale-online/new-guns-for-sale-today.cfm", { redirect: "follow", headers: { "User-Agent": "Mozilla/5.0" } })).text()
fs.writeFileSync("C:/Users/Evil/AppData/Local/Temp/opencode/gi_new.html", html)
const guns = parseGunsInternationalHTML(html)
console.log("GI new-guns page parsed:", guns.length)
for (const g of guns.slice(0, 4)) console.log("-", g.name.slice(0, 60), "|", g.category, "|", g.price)

const gc = await (await fetch("https://web.archive.org/web/2025/https://www.guns.com/", { redirect: "follow", headers: { "User-Agent": "Mozilla/5.0" } })).text()
const gcGuns = parseGunsComHTML(gc)
console.log("\nguns.com homepage@2025 parsed:", gcGuns.length)
