import { closestSnapshot } from "./common.mjs"

const t0 = Date.now()
try {
  const snap = await closestSnapshot("https://www.guns.com/firearms/handguns", { minTimestamp: "20250101" })
  console.log("snapshot:", JSON.stringify(snap), `${Date.now() - t0}ms`)
} catch (e) {
  console.error("FAILED", e.message, `${Date.now() - t0}ms`)
}
