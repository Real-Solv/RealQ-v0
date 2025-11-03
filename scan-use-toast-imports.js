const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname);
const srcDir = path.join(projectRoot, "app"); // ou "src" se você usa src/
const toastPath = path.join(projectRoot, "hooks", "use-toast.ts");

function getAllFiles(dir, ext = ".tsx", files = []) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, ext, files);
    } else if (file.endsWith(ext)) {
      files.push(fullPath);
    }
  });
  return files;
}

function scanImports(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const importRegex = /from\s+["']@\/hooks\/use-toast["']/g;

  if (importRegex.test(content)) {
    console.log(`🔍 Import encontrado em: ${filePath}`);

    if (!fs.existsSync(toastPath)) {
      console.error(`❌ Arquivo use-toast.ts não encontrado em /hooks`);
      console.error(`   → Corrija o caminho ou mova o arquivo para /hooks/use-toast.ts`);
    } else {
      console.log(`✅ Caminho válido: /hooks/use-toast.ts`);
    }
  }
}

console.log("🔎 Escaneando imports de '@/hooks/use-toast'...\n");

const files = getAllFiles(srcDir);
files.forEach(scanImports);

console.log("\n✅ Escaneamento concluído.");
