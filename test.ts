import path from "node:path";
import { hashElement } from "folder-hash";

const ponderDir = path.join("packages", "ponder");
const hash = await hashElement(ponderDir, {
    algo: "sha256",
    encoding: "hex",
    folders: {
        exclude: [".*", "generated", "node_modules"],
    },
    files: {
        include: ["**/*.ts", "config/**/*.ts", "package.json"],
    },
});

console.log(hash);

// 0c860d9d067899a211b9fe44bee69010e793bb6f19671fe88b7316b845e8b5e9
