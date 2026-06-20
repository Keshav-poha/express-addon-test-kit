const fs = require("fs");
const path = require("path");

const packagesDir = path.resolve(__dirname, "../packages");

const packages = fs.readdirSync(packagesDir);

for (const pkg of packages) {
    const cjsDir = path.join(packagesDir, pkg, "dist/cjs");
    // Ensure the cjs directory exists before writing
    if (fs.existsSync(cjsDir)) {
        fs.writeFileSync(
            path.join(cjsDir, "package.json"),
            JSON.stringify({ type: "commonjs" }, null, 2)
        );
        console.log(`Wrote package.json with CommonJS type to ${cjsDir}`);
    }
}
