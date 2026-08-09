import fs from "node:fs"

const lines = fs
  .readFileSync("C:/Users/Evil/AppData/Local/Temp/opencode/gi_prefix.txt", "utf8")
  .split("\n")
  .filter((l) => l.trim())
  .map((l) => l.trim().split(" "))

console.log("total lines:", lines.length)

const catPages = lines.filter(([, u]) => /\/guns-for-sale-online\/[a-z0-9-]+\.cfm$/.test(u) && !u.includes("gun_id"))
const sellers = lines.filter(([, u]) => /\.cfm$/.test(u) && !u.includes("guns-for-sale-online") && !u.includes("gun_id="))
const productPages = lines.filter(([, u]) => /\.cfm\?.*gun_id=\d+/.test(u))

console.log("category listing pages:", catPages.length)
console.log("seller pages:", sellers.length)
console.log("product pages:", productPages.length)

const cats = new Set(catPages.map(([, u]) => u.replace("https://www.gunsinternational.com/guns-for-sale-online/", "").replace(".cfm", "")))
console.log("distinct categories:", [...cats].sort().slice(0, 40))

console.log("\nsample category pages:")
for (const [ts, u] of catPages.slice(0, 10)) console.log(ts, u)
