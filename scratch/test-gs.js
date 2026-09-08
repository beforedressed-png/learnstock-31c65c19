import gs from "@jspawn/ghostscript-wasm";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  console.log("Starting GS...");
  try {
    globalThis.Module = {
      locateFile: function(path) {
        if (path === 'gs.wasm') {
          return __dirname + '/../node_modules/@jspawn/ghostscript-wasm/gs.wasm';
        }
        return path;
      },
      instantiateWasm: function(info, receiveInstance) {
        const wasmBinary = fs.readFileSync(__dirname + '/../node_modules/@jspawn/ghostscript-wasm/gs.wasm');
        WebAssembly.instantiate(wasmBinary, info).then(function(result) {
          receiveInstance(result.instance);
        });
        return {};
      }
    };
    const gsModule = await gs();
    console.log("GS Module loaded.");
    console.log("WASM Ghostscript is ready.");
  } catch (err) {
    console.error("Failed:", err);
  }
}

run();
