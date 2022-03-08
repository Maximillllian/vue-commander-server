import drivelist from "drivelist";
import fs from "fs";
import path from "path";
import open from "open";
import { getFileType, isRoot, copyWithoutOverwrite } from "./utils/utils.js";

export async function getDrives(req, res) {
  try {
    const drivesNames = await getDrivesNames();
    return res.json(drivesNames);
  } catch (err) {
    return res.status(500).json({ message: "Ошибка при чтении дисков" });
  }
}

async function getDrivesNames() {
  const rawDrivesData = await drivelist.list();
  const drivesNames = rawDrivesData.flatMap((drive) => drive.mountpoints);
  return drivesNames;
}

export async function getFolder(req, res) {
  try {
    const folderPath = req.body.path;
    const folder = createFolderData(folderPath);
    return res.json({ filesData: folder, isRoot: isRoot(folderPath) });
  } catch (err) {
    return res.status(404).json({ message: "Такой директории не существует" });
  }
}

function createFolderData(folderPath) {
  const files = fs.readdirSync(folderPath, { withFileTypes: true });
  let folder = [];
  files.forEach((file) => {
    const fileData = getFileData(folderPath, file);
    folder.push(fileData);
  });
  return folder;
}

function getFileData(folderPath, file) {
  const currentFilePath = path.resolve(folderPath, file.name);
  let fileData = {
    name: file.name,
    path: currentFilePath,
    is_directory: file.isDirectory(),
    is_file: file.isFile(),
    extension: "",
    type: getFileType(file),
  };

  if (file.isFile()) {
    fileData.extension = path.extname(currentFilePath);
  }

  const fileStats = getFileStats(currentFilePath);
  if (fileStats) {
    fileData.last_modified = fileStats.mtime || fileStats.ctime;
    fileData.size = fileStats.size;
  }

  return fileData;
}

function getFileStats(filePath) {
  // По разным причинам из функции fs.statSync может вылететь ошибка
  try {
    const fileStats = fs.statSync(filePath);
    return fileStats;
  } catch (err) {}
}

export async function openFileNative(req, res) {
  try {
    const filePath = req.body.path;
    await open(path.resolve(filePath));
    res.json({
      message: "Файл успешно открыт",
    });
  } catch (err) {
    res.status(500).json({
      message: "Ошибка при открытии файла",
    });
  }
}

export async function getParentFolder(req, res) {
  try {
    const currentPath = req.body.path;
    const parentFolderPath = path.resolve(currentPath, "..");
    return res.json(parentFolderPath);
  } catch (err) {}
}

export function deleteFiles(req, res) {
  try {
    const pathsForDelete = req.body.paths;
    pathsForDelete.forEach((filePath) => {
      fs.rmSync(filePath, { recursive: true, force: true });
    });
    return res.json({
      message: "Файлы успешно удалены",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Ошибка при удалении файлов",
    });
  }
}

export function copyFiles(req, res) {
  try {
    const { files } = req.body;
    files.forEach((file) => {
      copyWithoutOverwrite(file.sourcePath, file.destinationPath);
    });
    return res.json({
      message: "Файлы успешно скопированы",
    });
  } catch (err) {
    res.status(404).json({
      message: "Ошибка при копировании файлов, проверьте путь",
    });
  }
}

export function moveFiles(req, res) {
  try {
    const { files } = req.body;
    files.forEach((file) => {
      fs.renameSync(file.sourcePath, file.destinationPath);
    });
    return res.json({
      message: "Файлы успешно перемещены",
    });
  } catch (err) {
    res.status(404).json({
      message: "Ошибка при перемещении файлов, проверьте путь",
    });
  }
}

export function rename(req, res) {
  try {
    const { sourcePath, newName } = req.body;
    renameFile(sourcePath, newName);
    return res.json({
      message: "Файлы успешно переименованы",
    });
  } catch (err) {
    res.status(404).json({
      message: "Проверьте название файла, возможно такой файл уже существует",
    });
  }
}

function renameFile(sourcePath, newName) {
  const dirPath = path.dirname(sourcePath);
  const newPath = path.resolve(dirPath, newName);
  fs.renameSync(sourcePath, newPath);
}
