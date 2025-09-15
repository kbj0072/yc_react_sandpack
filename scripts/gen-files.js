#!/usr/bin/env node
import { promises as fs } from "fs";
import path from "path";

// 지시어 규칙(아무거나 택1):
// JS/TS/JSX/TSX: // sandpack:hidden, // sandpack:hidden:true, // sandpack:visible, // sandpack:visible:false
// CSS: /* sandpack:hidden */
// HTML: <!-- sandpack:hidden:false -->

const ROOT = process.cwd();
const PROJECTS_DIR = path.join(ROOT, "public", "projects");

// 포함할 텍스트 확장자 (필요시 추가)
const TEXT_EXT = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".json",
  ".html",
  ".css",
  ".md",
  ".txt",
]);

// 무시할 이름
const IGNORE_NAMES = new Set(["files.json", ".DS_Store"]);

async function isDir(p) {
  try {
    return (await fs.stat(p)).isDirectory();
  } catch {
    return false;
  }
}

async function walk(dir, base = "") {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const d of entries) {
    if (d.name.startsWith(".")) continue;
    if (IGNORE_NAMES.has(d.name)) continue;

    const abs = path.join(dir, d.name);
    const rel = path.join(base, d.name);

    if (d.isDirectory()) {
      out.push(...(await walk(abs, rel)));
    } else {
      out.push({ abs, rel });
    }
  }
  return out;
}

function detectMain(relFiles) {
  const candidates = ["index.jsx", "index.js", "src/index.jsx", "src/index.js"];
  const set = new Set(relFiles.map((f) => f.rel.replace(/\\/g, "/")));
  const hit = candidates.find((c) => set.has(c));
  return hit ? `/${hit}` : "/index.js";
}

function stripBOM(s) {
  if (s.charCodeAt(0) === 0xfeff) return s.slice(1);
  return s;
}

// 첫 줄(첫 비어있지 않은 줄)의 주석에서 hidden/visible 지시어 파싱
function parseHiddenDirective(rel, raw) {
  const ext = path.extname(rel).toLowerCase();
  const src = stripBOM(raw).replace(/^\s+/, ""); // 좌측 공백 제거

  // 도우미: 패턴 매칭 후 hidden bool 계산
  const decide = (content) => {
    const re =
      /(?:@?sandpack:)?\s*(hidden|visible)\s*(?::|=)?\s*(true|false)?/i;
    const m = content.match(re);
    if (!m) return undefined;
    const key = m[1].toLowerCase();
    const val = m[2]?.toLowerCase();
    if (key === "hidden") {
      // hidden:true(기본), hidden:false
      return val ? val === "true" : true;
    }
    if (key === "visible") {
      // visible:true(기본) -> hidden=false, visible:false -> hidden=true
      const visible = val ? val === "true" : true;
      return !visible;
    }
    return undefined;
  };

  // 코멘트 추출: 파일 타입별 첫 줄 코멘트만 확인
  // JS류: //... 또는 /* ... */
  if ([".js", ".jsx", ".ts", ".tsx", ".json", ".md", ".txt"].includes(ext)) {
    // line comment
    if (src.startsWith("//")) {
      const line = src.split(/\r?\n/, 1)[0].slice(2).trim();
      return decide(line);
    }
    // block comment
    if (src.startsWith("/*")) {
      const end = src.indexOf("*/");
      const block = end >= 0 ? src.slice(2, end).trim() : src.slice(2).trim();
      return decide(block);
    }
    return undefined;
  }

  // CSS: /* ... */
  if (ext === ".css") {
    if (src.startsWith("/*")) {
      const end = src.indexOf("*/");
      const block = end >= 0 ? src.slice(2, end).trim() : src.slice(2).trim();
      return decide(block);
    }
    return undefined;
  }

  // HTML: <!-- ... -->
  if (ext === ".html") {
    if (src.startsWith("<!--")) {
      const end = src.indexOf("-->");
      const block = end >= 0 ? src.slice(4, end).trim() : src.slice(4).trim();
      return decide(block);
    }
    return undefined;
  }

  return undefined;
}

async function buildFilesMap(projectPath, relFiles) {
  const files = {};

  for (const f of relFiles) {
    const ext = path.extname(f.rel).toLowerCase();
    if (!TEXT_EXT.has(ext)) continue;

    const code = await fs.readFile(f.abs, "utf8");
    const entry = { code };

    // 지시어 우선
    const directive = parseHiddenDirective(f.rel, code);

    // 기본값: App.js만 보이고 나머지는 숨김
    const base = path.basename(f.rel);
    const defaultHidden = !(base === "App.js" || base === "App.jsx");

    entry.hidden = directive !== undefined ? directive : defaultHidden;

    files[`/${f.rel.replace(/\\/g, "/")}`] = entry;
  }

  // package.json 없으면 자동 생성
  if (!files["/package.json"]) {
    const main = detectMain(relFiles);
    files["/package.json"] = {
      code: JSON.stringify(
        {
          name: path.basename(projectPath),
          version: "1.0.0",
          main,
          dependencies: {
            react: "19.0.0",
            "react-dom": "19.0.0",
          },
        },
        null,
        2
      ),
      hidden: true,
    };
  }

  // index.html 없으면 자동 생성
  if (!files["/index.html"]) {
    files["/index.html"] = { code: "<div id='root'></div>", hidden: true };
  }

  return files;
}

async function main() {
  if (!(await isDir(PROJECTS_DIR))) {
    console.error("Projects dir not found:", PROJECTS_DIR);
    process.exit(1);
  }

  const dirs = (await fs.readdir(PROJECTS_DIR, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  if (dirs.length === 0) {
    console.warn("No project folders in", path.relative(ROOT, PROJECTS_DIR));
    return;
  }

  for (const dirName of dirs) {
    const abs = path.join(PROJECTS_DIR, dirName);
    const relFiles = await walk(abs);
    const filesMap = await buildFilesMap(abs, relFiles);
    const outPath = path.join(abs, "files.json");
    await fs.writeFile(
      outPath,
      JSON.stringify(filesMap, null, 2) + "\n",
      "utf8"
    );
    console.log("✓ wrote", path.relative(ROOT, outPath));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
