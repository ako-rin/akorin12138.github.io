import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 博客文章目录（改成你自己的）
const POSTS_DIR = path.join(__dirname, "posts");

function formatDate(date) {
  const pad = (n) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());

  // 时区偏移
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const hoursOffset = pad(Math.floor(Math.abs(offset) / 60));
  const minutesOffset = pad(Math.abs(offset) % 60);

  return `${year}-${month}-${day} ${hour}:${minute}:${second} ${sign}${hoursOffset}${minutesOffset}`;
}

function getGitLastCommitTime(filePath) {
  try {
    const output = execSync(`git log -1 --format=%ct -- "${filePath}"`, {
      encoding: "utf-8",
    }).trim();

    if (!output) return null;
    return new Date(parseInt(output, 10) * 1000); // Git 提交时间戳
  } catch (e) {
    console.warn(`⚠ 无法获取 Git 时间: ${filePath}`);
    return null;
  }
}

function updateFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = matter(raw);

  const gitTime = getGitLastCommitTime(filePath);
  if (!gitTime) return;

  parsed.data.updated = formatDate(gitTime);

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

walkDir(POSTS_DIR);
