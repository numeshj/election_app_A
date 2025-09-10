// Map paths utility for loading Sri Lanka district paths
import pathsData from '../data/paths.json';

// Minimal wrapper so map paths can be shared / extended
export function normalizeName(n) {
  return (n || "").toLowerCase().replace(/\s+/g, "").replace(/-/g, "");
}

export function aliasName(name) {
  const n = normalizeName(name);
  const map = {
    mulaithivu: "mullaitivu",
    monaragala: "moneragala",
    kandy: "mahanuwara",
  };
  return map[n] || name;
}

// Load all Sri Lanka district paths from paths.json
export function sriLankaPaths() {
  return pathsData.map(path => ({
    name: path.name,
    d: path.d
  }));
}
