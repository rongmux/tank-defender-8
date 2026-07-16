const assert = require("assert").strict;
const path = require("path");
const { discoverTestFiles } = require("../helpers/test-file-discovery");

function directoryEntry(name, type) {
  return {
    name,
    isDirectory: () => type === "directory",
    isFile: () => type === "file"
  };
}

const root = path.resolve("fixture-root");
const suite = path.join("tests", "unit");
const nested = path.join(suite, "nested");
const fixture = new Map([
  [path.join(root, suite), [
    directoryEntry("z.test.js", "file"),
    directoryEntry("notes.md", "file"),
    directoryEntry("nested", "directory"),
    directoryEntry("a.test.js", "file"),
    directoryEntry("linked.test.js", "link")
  ]],
  [path.join(root, nested), [
    directoryEntry("ignored.js", "file"),
    directoryEntry("b.test.js", "file")
  ]]
]);
const fakeFileSystem = {
  readdirSync(directory, options) {
    assert.deepEqual(options, { withFileTypes: true });
    assert(fixture.has(directory), `unexpected fixture directory: ${directory}`);
    return fixture.get(directory);
  }
};

assert.deepEqual(discoverTestFiles(root, suite, fakeFileSystem), [
  path.join(suite, "a.test.js"),
  path.join(nested, "b.test.js"),
  path.join(suite, "z.test.js")
]);

const repositoryRoot = path.resolve(__dirname, "../..");
const actualUnitTests = discoverTestFiles(repositoryRoot, suite);
assert(actualUnitTests.includes(path.join(suite, "test-file-discovery.test.js")));
assert.deepEqual(actualUnitTests, actualUnitTests.slice().sort());
assert.equal(new Set(actualUnitTests).size, actualUnitTests.length);

console.log("test-file-discovery unit test passed");
