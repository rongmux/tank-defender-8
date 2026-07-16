const fs = require("fs");
const path = require("path");

function compareEntryNames(a, b) {
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;
  return 0;
}

function discoverTestFiles(root, relativeDirectory, fileSystem) {
  const fsApi = fileSystem || fs;
  const absoluteDirectory = path.join(root, relativeDirectory);
  const entries = fsApi.readdirSync(absoluteDirectory, { withFileTypes: true });

  return entries.slice().sort(compareEntryNames).flatMap((entry) => {
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) return discoverTestFiles(root, relativePath, fsApi);
    if (entry.isFile() && entry.name.endsWith(".test.js")) return [relativePath];
    return [];
  });
}

module.exports = Object.freeze({ discoverTestFiles });
