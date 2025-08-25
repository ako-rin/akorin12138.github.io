import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_POSTS_DIR = path.join(__dirname, "./pages/posts");

function formatDate(date) {
  const pad = (n) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());

  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const hoursOffset = pad(Math.floor(Math.abs(offset) / 60));
  const minutesOffset = pad(Math.abs(offset) % 60);

  return `${year}-${month}-${day} ${hour}:${minute}:${second} ${sign}${hoursOffset}${minutesOffset}`;
}

function getGitCommitTime(filePath) {
  try {
    const output = execSync(`git log -1 --format=%ct -- "${filePath}"`, {
      encoding: "utf-8",
    }).trim();
    if (!output) return null;
    return new Date(parseInt(output, 10) * 1000);
  } catch {
    return null;
  }
}

function getFileUpdateTime(filePath) {
  try {
    // 先检查是否在暂存区
    const stagedFiles = execSync("git diff --cached --name-only", {
      encoding: "utf-8",
    })
      .split("\n")
      .filter(Boolean);

    const relPath = path.relative(process.cwd(), filePath);

    if (stagedFiles.includes(relPath)) {
      // 在暂存区 → 用修改时间近似
      const stats = fs.statSync(filePath);
      return stats.mtime;
    } else {
      // 否则 → 用最后一次 commit 时间
      return getGitCommitTime(filePath);
    }
  } catch (err) {
    console.warn(`⚠ 无法获取更新时间: ${filePath}`);
    return null;
  }
}

function updateFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = matter(raw);

  const updateTime = getFileUpdateTime(filePath);
  if (!updateTime) return;

  parsed.data.updated = formatDate(updateTime);

  const newContent = matter.stringify(parsed.content, parsed.data);
  fs.writeFileSync(filePath, newContent, "utf-8");

  console.log(`✔ Updated: ${filePath} -> ${parsed.data.updated}`);
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith(".md")) {
      updateFile(filePath);
    }
  });
}

function updateStagedMdFiles() {
  try {
    const stagedFiles = execSync("git diff --cached --name-only", {
      encoding: "utf-8",
    })
      .split("\n")
      .filter((f) => f.endsWith(".md"));

    stagedFiles.forEach((relPath) => {
      const absPath = path.resolve(process.cwd(), relPath);
      if (fs.existsSync(absPath)) {
        updateFile(absPath);
      }
    });
  } catch {
    console.warn("⚠ 无法获取暂存区文件");
  }
}

// ----------------------
// 命令行参数处理
// ----------------------
const args = process.argv.slice(2);

if (args.length === 0) {
  // 默认更新 ./pages/posts 目录
  walkDir(DEFAULT_POSTS_DIR);
} else if (args[0] === "--staged") {
  // 更新暂存区中的 .md 文件
  updateStagedMdFiles();
} else {
  args.forEach((arg) => {
    const absPath = path.isAbsolute(arg) ? arg : path.join(process.cwd(), arg);

    if (fs.existsSync(absPath)) {
      if (fs.statSync(absPath).isDirectory()) {
        walkDir(absPath); // 指定目录
      } else if (absPath.endsWith(".md")) {
        updateFile(absPath); // 指定文件
      } else {
        console.warn(`⚠ 不是 Markdown 文件: ${arg}`);
      }
    } else {
      console.warn(`⚠ 文件或目录不存在: ${arg}`);
    }
  });
}
