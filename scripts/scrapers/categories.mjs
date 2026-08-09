export function normalizeCategory(raw) {
  const v = String(raw ?? "").toLowerCase()
  if (/shotgun|gauge|gague/.test(v)) return "shotguns"
  if (/rifle/.test(v)) return "rifles"
  if (/blackpowder|black-powder|muzzle|antique|flintlock/.test(v)) return "blackpowder"
  if (/air gun|airgun|air-rifle|air-pistol|bb gun|pellet/.test(v)) return "air-guns"
  if (/handgun|pistol|revolver|semi[- ]?auto/.test(v)) return "handguns"
  return "other"
}

export function inferSubCategory(text) {
  const v = String(text ?? "").toLowerCase()
  if (/bolt action|bolt-action/.test(v)) return "Bolt Action"
  if (/semi[- ]auto/.test(v)) return "Semi-Auto"
  if (/revolver|double action/.test(v)) return "Revolver"
  if (/lever action|lever-action/.test(v)) return "Lever Action"
  if (/pump action|pump-action|pump/.test(v)) return "Pump"
  if (/over[- ]under/.test(v)) return "Over/Under"
  if (/break action|break-action|single[- ]shot|single shot/.test(v)) return "Break Action"
  if (/flintlock|muzzleloader|black powder/.test(v)) return "Muzzleloader"
  if (/air/.test(v)) return "Air"
  return ""
}
