const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname);
const aliasRoot = path.join(projectRoot); // assume que @/ aponta para a raiz
const srcDir = path.join(projectRoot, "app"); // ou "src" se você usa src/

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

function resolveImportPath(importPath) {
  const basePath = path.join(aliasRoot, importPath);
  const tsxFile = basePath + ".tsx";
  const indexFile = path.join(basePath, "index.tsx");

  if (fs.existsSync(tsxFile)) return importPath + ".tsx";
  if (fs.existsSync(indexFile)) return path.join(importPath, "index.tsx");
  return null;
}

function fixImports(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  const importRegex = /from\s+["']@\/([^"']+)["']/g;
  let match;
  let fixed = false;

  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    const resolved = resolveImportPath(importPath);

    if (!resolved) {
      console.error(`❌ Import quebrado em ${filePath}`);
      console.error(`   → Não encontrado: @/${importPath}`);
      continue;
    }

    const actualPath = path.join(aliasRoot, resolved);
    const correctCase = fs.readdirSync(path.dirname(actualPath)).find(
      (f) => f.toLowerCase() === path.basename(actualPath).toLowerCase()
    );

    if (correctCase && correctCase !== path.basename(actualPath)) {
      const correctedImport = importPath.replace(
        path.basename(importPath),
        correctCase.replace(".tsx", "")
      );
      content = content.replace(`@/${importPath}`, `@/${correctedImport}`);
      fixed = true;
      console.log(`🔧 Corrigido: @/${importPath} → @/${correctedImport}`);
    }
  }

  if (fixed) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✅ Atualizado: ${filePath}`);
  }
}

console.log("🔍 Corrigindo imports quebrados e capitalização...\n");

const files = getAllFiles(srcDir);
files.forEach(fixImports);

console.log("\n✅ Correção concluída.");
