import fs from "node:fs"

const html = fs.readFileSync("C:/Users/Evil/AppData/Local/Temp/opencode/gc_1911.html", "utf8")

const dataAttrs = [...html.matchAll(/:data="([^"]+)"/g)]
console.log("total :data attrs:", dataAttrs.length)
for (const m of dataAttrs) {
  const raw = m[1].replaceAll("&quot;", '"').replaceAll("&amp;", "&")
  let obj = null
  try { obj = JSON.parse(raw) } catch {}
  if (obj) {
    const keys = Object.keys(obj)
    console.log("- component keys:", keys.join(","), "| items:", Array.isArray(obj.items) ? obj.items.length : "-")
  }
}

const prodCount = (html.match(/product-card/g) || []).length
const nameCount = (html.match(/NIGHTHAWK CUSTOM VICE/g) || []).length
console.log("product-card occurrences:", prodCount, "| example name occurrences:", nameCount)
const i = html.indexOf("NIGHTHAWK CUSTOM VICE PRESIDENT")
if (i >= 0) console.log("context:", html.slice(i - 300, i + 200).replace(/\s+/g, " "))
