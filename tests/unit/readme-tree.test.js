const assert = require("assert").strict;
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");
const ignoredDirectories = new Set([".git", ".agents", ".codex", ".reasonix"]);

function readTreeBlock(fileName) {
  const source = fs.readFileSync(path.join(root, fileName), "utf8");
  assert.equal(source.includes("\uFFFD"), false, `${fileName} contains a replacement character`);
  const fences = source.match(/^```/gm) || [];
  assert.equal(fences.length % 2, 0, `${fileName} has unbalanced code fences`);
  const match = source.match(/```text\r?\n([\s\S]*?)\r?\n```/);
  assert(match, `${fileName} must contain a text file-tree block`);
  return match[1];
}

function parseDocumentedFiles(tree) {
  const files = [];
  const directories = [];
  const lines = tree.split(/\r?\n/);
  assert.equal(lines.shift(), "tank-defender-8/");

  for (const line of lines) {
    const match = line.match(/^((?:\|   )*)(?:\|-- |`-- )(.+)$/);
    assert(match, `invalid tree line: ${line}`);
    const depth = match[1].length / 4 + 1;
    const entry = match[2];
    const parent = directories.slice(0, depth - 1);
    const relativePath = [...parent, entry.replace(/\/$/, "")].join("/");
    if (entry.endsWith("/")) {
      directories[depth - 1] = entry.slice(0, -1);
      directories.length = depth;
    } else {
      files.push(relativePath);
    }
  }

  return files.sort();
}

function listWorkspaceFiles(directory = root, relativeDirectory = "") {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const relativePath = relativeDirectory
      ? `${relativeDirectory}/${entry.name}`
      : entry.name;
    if (entry.isDirectory()) {
      files.push(...listWorkspaceFiles(path.join(directory, entry.name), relativePath));
    } else {
      files.push(relativePath);
    }
  }
  return files.sort();
}

const englishTree = readTreeBlock("README.md");
const chineseTree = readTreeBlock("README.zh-CN.md");
assert.equal(chineseTree, englishTree, "README file trees must match exactly");

const documentedFiles = parseDocumentedFiles(englishTree);
const workspaceFiles = listWorkspaceFiles();
assert.deepEqual(documentedFiles, workspaceFiles);

console.log(`README trees match the ${workspaceFiles.length}-file workspace`);
