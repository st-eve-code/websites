import fs from "node:fs"
import { parseGunsComHTML } from "./scrapers/gunscom.mjs"
import { parseGunsInternationalHTML } from "./scrapers/gunsinternational.mjs"
import { parseReliableGunHTML } from "./scrapers/reliablegun.mjs"

const gc = fs.readFileSync("C:/Users/Evil/AppData/Local/Temp/opencode/gc_arch.html", "utf8")
const gi = fs.readFileSync("C:/Users/Evil/AppData/Local/Temp/opencode/gi_arch.html", "utf8")
const rg = fs.readFileSync("C:/Users/Evil/AppData/Local/Temp/opencode/rg_arch.html", "utf8")

const gcGuns = parseGunsComHTML(gc)
const giGuns = parseGunsInternationalHTML(gi)
const rgGuns = parseReliableGunHTML(rg)

console.log("GUNS.COM:", gcGuns.length)
if (gcGuns[0]) console.log(JSON.stringify(gcGuns[0], null, 2))
console.log("\nGUNS INTERNATIONAL:", giGuns.length)
if (giGuns[0]) console.log(JSON.stringify(giGuns[0], null, 2))
console.log("\nRELIABLE GUN:", rgGuns.length)
if (rgGuns[0]) console.log(JSON.stringify(rgGuns[0], null, 2))
