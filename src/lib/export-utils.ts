import JSZip from "jszip";
// @ts-ignore
import createGS from "@jspawn/ghostscript-wasm/gs.js";
import { buildAdobeCsv, type CsvRow } from "./csv";
import type { StockMetadata } from "./gemini";

export interface ExportItem {
  file: File;
  meta: StockMetadata;
}

// Convert vector file (.eps, .ai) via client-side Ghostscript WebAssembly
export async function convertVectorViaWasm(file: File): Promise<Blob> {
  const mod = await createGS({
    locateFile: (f: string) => `https://unpkg.com/@jspawn/ghostscript-wasm@0.0.2/${f}`,
    print: (text: string) => console.log("[WASM-GS]", text),
    printErr: (text: string) => console.warn("[WASM-GS]", text),
  });

  const arrayBuffer = await file.arrayBuffer();
  const fileData = new Uint8Array(arrayBuffer);

  const cleanExt = (file.name.split(".").pop() || "eps").toLowerCase();
  const id = Math.random().toString(36).substring(2, 9);
  const inputFileName = `/input_${id}.${cleanExt}`;
  const outputFileName = `/output_${id}.jpg`;

  mod.FS.writeFile(inputFileName, fileData);

  try {
    mod.callMain([
      "-dNOPAUSE",
      "-dBATCH",
      "-sDEVICE=jpeg",
      "-dJPEGQ=95",
      "-r300",
      "-dEPSCrop",
      "-dUseCropBox",
      "-dTextAlphaBits=4",
      "-dGraphicsAlphaBits=4",
      "-dDOINTERPOLATE",
      `-sOutputFile=${outputFileName}`,
      inputFileName,
    ]);

    const jpgBytes = mod.FS.readFile(outputFileName);
    return new Blob([jpgBytes], { type: "image/jpeg" });
  } catch (err) {
    console.error("Ghostscript WASM conversion failed:", err);
    throw new Error(`Vector conversion failed: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    try {
      mod.FS.unlink(inputFileName);
    } catch (_) {}
    try {
      mod.FS.unlink(outputFileName);
    } catch (_) {}
  }
}

// Backward-compatible alias
export const convertVectorViaBackend = convertVectorViaWasm;

// Convert image File to dataURL
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Read image file as text (for SVG)
export function fileToText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

// Load Image from file (handles SVG and raster images)
export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

// Convert HTMLImageElement to PNG or JPG Blob via Canvas
export function imageToCanvasBlob(
  img: HTMLImageElement,
  format: "png" | "jpeg",
  quality = 0.95
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width || 1920;
    canvas.height = img.naturalHeight || img.height || 1080;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Failed to get 2D canvas context"));
      return;
    }
    // Fill white background if jpeg (transparency handling)
    if (format === "jpeg") {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas blob conversion failed"));
        }
      },
      `image/${format}`,
      quality
    );
  });
}

// Convert image to SVG wrapper
export async function convertToSvgBlob(file: File, name: string): Promise<Blob> {
  // If original file is already SVG, just return it
  if (file.name.toLowerCase().endsWith(".svg") || file.type === "image/svg+xml") {
    const text = await fileToText(file);
    return new Blob([text], { type: "image/svg+xml" });
  }

  // If raster image, wrap it in SVG element
  try {
    const img = await loadImage(file);
    const base64 = await fileToDataUrl(file);
    const width = img.naturalWidth || img.width || 800;
    const height = img.naturalHeight || img.height || 600;
    const svgText = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <image width="${width}" height="${height}" href="${base64}" />
</svg>`;
    return new Blob([svgText], { type: "image/svg+xml" });
  } catch (error) {
    // Fallback if image failed to load (e.g. EPS/AI file which browser can't load)
    const svgText = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect width="800" height="600" fill="#1e1b4b" />
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#a78bfa">${name}</text>
</svg>`;
    return new Blob([svgText], { type: "image/svg+xml" });
  }
}

// Convert image to PostScript EPS
export async function convertToEpsBlob(file: File): Promise<Blob> {
  // If original is SVG or EPS, we can try to convert it or use it as is
  if (file.name.toLowerCase().endsWith(".eps") || file.name.toLowerCase().endsWith(".ai")) {
    return file; // Return as-is for binary/PostScript files we can't rasterize
  }

  try {
    const img = await loadImage(file);
    const canvas = document.createElement("canvas");
    // Limit EPS output resolution if extremely large to prevent browser crash/high memory usage
    const MAX_DIM = 2000;
    let width = img.naturalWidth || img.width || 800;
    let height = img.naturalHeight || img.height || 600;
    if (width > MAX_DIM || height > MAX_DIM) {
      const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not create canvas context");
    
    // Fill white background for the EPS image
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    
    let hexData = "";
    // Build hex color list
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i].toString(16).padStart(2, "0");
      const g = data[i + 1].toString(16).padStart(2, "0");
      const b = data[i + 2].toString(16).padStart(2, "0");
      hexData += r + g + b;
      
      // Line break every 78 hex characters (26 pixels) to conform to PostScript line length standards
      if (((i / 4) + 1) % 26 === 0) {
        hexData += "\n";
      }
    }
    
    const epsContent = `%!PS-Adobe-3.0 EPSF-3.0
%%BoundingBox: 0 0 ${width} ${height}
%%Title: ${file.name}
%%Creator: Learn Stock AI Converter
%%Pages: 1
%%EndComments
%%BeginProlog
/readstring { currentfile exch readhexstring pop } bind def
%%EndProlog
%%Page: 1 1
gsave
${width} ${height} scale
${width} ${height} 8 [${width} 0 0 -${height} 0 ${height}]
{currentfile 3 string readstring} false 3 colorimage
${hexData}
grestore
showpage
%%EOF`;
    
    return new Blob([epsContent], { type: "application/postscript" });
  } catch (error) {
    // If it's not loadable, just return the original file bytes
    return file;
  }
}

// Packages the CSV and assets into a ZIP file and downloads it
export async function downloadZipArchive(
  items: ExportItem[],
  selectedFormats: string[], // e.g. ['jpg', 'png', 'svg', 'eps', 'ai', 'original']
  csvFilenameMode: "original" | "format",
  zipFileName: string,
  onProgress?: (progressText: string) => void
): Promise<void> {
  const zip = new JSZip();
  const csvRows: CsvRow[] = [];

  onProgress?.("Initializing export package...");

  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];
    const baseName = item.file.name.replace(/\.[^.]+$/, "");
    
    // Choose primary extension for CSV matching
    let csvExtension = item.file.name.split(".").pop() || "";
    if (csvFilenameMode === "format" && selectedFormats.length > 0) {
      // Pick first non-original selected format as main extension
      const formatExt = selectedFormats.find((f) => f !== "original");
      if (formatExt) {
        csvExtension = formatExt;
      }
    }
    
    const targetFilename = `${baseName}.${csvExtension}`;
    csvRows.push({
      filename: targetFilename,
      meta: item.meta,
    });

    onProgress?.(`Processing file ${idx + 1} of ${items.length}: ${item.file.name}`);

    // Export original if selected
    if (selectedFormats.includes("original")) {
      zip.file(item.file.name, item.file);
    }

    // Export other selected formats
    for (const fmt of selectedFormats) {
      if (fmt === "original") continue;

      try {
        if (fmt === "jpg") {
          // If the file is already a JPEG, we can package the file directly, otherwise convert it
          if (item.file.name.toLowerCase().endsWith(".jpg") || item.file.name.toLowerCase().endsWith(".jpeg")) {
            zip.file(`${baseName}.jpg`, item.file);
          } else if (item.file.name.toLowerCase().endsWith(".eps") || item.file.name.toLowerCase().endsWith(".ai")) {
            onProgress?.(`Converting ${item.file.name} to JPG via WebAssembly...`);
            const blob = await convertVectorViaWasm(item.file);
            zip.file(`${baseName}.jpg`, blob);
          } else {
            const img = await loadImage(item.file);
            const blob = await imageToCanvasBlob(img, "jpeg");
            zip.file(`${baseName}.jpg`, blob);
          }
        } else if (fmt === "png") {
          if (item.file.name.toLowerCase().endsWith(".png")) {
            zip.file(`${baseName}.png`, item.file);
          } else {
            const img = await loadImage(item.file);
            const blob = await imageToCanvasBlob(img, "png");
            zip.file(`${baseName}.png`, blob);
          }
        } else if (fmt === "svg") {
          const blob = await convertToSvgBlob(item.file, baseName);
          zip.file(`${baseName}.svg`, blob);
        } else if (fmt === "eps") {
          const blob = await convertToEpsBlob(item.file);
          zip.file(`${baseName}.eps`, blob);
        } else if (fmt === "ai") {
          const blob = await convertToEpsBlob(item.file);
          zip.file(`${baseName}.ai`, blob);
        }
      } catch (err) {
        console.error(`Error converting ${item.file.name} to ${fmt}:`, err);
        // Fallback: package original file but with target extension
        zip.file(`${baseName}.${fmt}`, item.file);
      }
    }
  }

  // Generate metadata CSV
  onProgress?.("Generating metadata CSV...");
  const csvContent = buildAdobeCsv(csvRows);
  zip.file(`${zipFileName}-metadata.csv`, csvContent);

  // Generate ZIP blob
  onProgress?.("Creating ZIP archive (this may take a moment)...");
  const zipBlob = await zip.generateAsync({ type: "blob" });

  // Download ZIP
  onProgress?.("Downloading ZIP...");
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${zipFileName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
