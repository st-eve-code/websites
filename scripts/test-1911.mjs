import fs from "node:fs"
import { parseGunsComHTML } from "./scrapers/gunscom.mjs"

const html = fs.readFileSync("C:/Users/Evil/AppData/Local/Temp/opencode/gc_1911.html", "utf8")
const guns = parseGunsComHTML(html)
console.log("1911 page1 parsed guns:", guns.length)
for (const g of guns.slice(0, 5)) {
  console.log("-", g.name, "|", g.category, "|", g.price, "|", g.subCategory)
}
