import fs from "node:fs"

const html = fs.readFileSync("C:/Users/Evil/AppData/Local/Temp/opencode/gi_arch.html", "utf8")
const hrefs = [...html.matchAll(/href="([^"]*guns-for-sale-online[^"]*)"/g)].map((m) => m[1])
const unique = [...new Set(hrefs.map((h) => h.replace(/^http:\/\/web\.archive\.org\/web\/\d+\//, "")))].slice(0, 60)
console.log(unique.join("\n"))
