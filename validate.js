const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const html = fs.readFileSync("login.html", "utf8");

const scripts = [
    ...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)
];

if (scripts.length === 0) {
    console.log("No inline JavaScript found.");
    process.exit(0);
}

let failed = false;

scripts.forEach((script, index) => {
    const tempFile = path.join(
        os.tmpdir(),
        `login-check-${process.pid}-${index}.js`
    );

    fs.writeFileSync(tempFile, script[1]);

    const result = spawnSync(
        process.execPath,
        ["--check", tempFile],
        { encoding: "utf8" }
    );

    fs.rmSync(tempFile, { force: true });

    if (result.status !== 0) {
        failed = true;
        console.error(result.stderr || result.error);
    }
});

if (failed) {
    console.error("JavaScript syntax validation FAILED");
    process.exit(1);
}

console.log("JavaScript syntax validation SUCCESS");
