import path from "path";
import fs from "fs";
import fse from "fs-extra";

const extensionsFilePath = path.resolve("src", "utils", "extensions.json");
const { imageExtensions, audioExtensions, videoExtensions, textExtensions } =
  JSON.parse(fs.readFileSync(extensionsFilePath));

export function getFileType(file) {
  if (file.isDirectory()) {
    return "folder";
  } else if (file.isFile()) {
    return detectFileTypeByExtension(file);
  }
}

function detectFileTypeByExtension(file) {
  const extension = parseExtension(file.name);

  if (!extension) {
    return "file";
  } else if (imageExtensions.includes(extension)) {
    return "image";
  } else if (audioExtensions.includes(extension)) {
    return "audio";
  } else if (videoExtensions.includes(extension)) {
    return "video";
  } else if (textExtensions.includes(extension)) {
    return "text";
  }
  return "file";
}

function parseExtension(fileName) {
  const fileSplitedByDot = fileName.split(".");
  return fileSplitedByDot[fileSplitedByDot.length - 1];
}

export function isRoot(folderPath) {
  const parentPath = path.resolve(folderPath, "..");
  return parentPath === folderPath;
}

// TODO: Подумать, что можно сделать с throw error
export function copyWithoutOverwrite(sourcePath, destinationPath) {
  const copyOptions = {
    overwrite: false,
    errorOnExist: true,
  };

  try {
    fse.copySync(sourcePath, destinationPath, copyOptions);
  } catch (error) {
    if (error.message.includes("already exists")) {
      // Если  такой файл существует, добавляем в название файла '- копия (n)'
      const newFileName = getNameWithCopiesCount(destinationPath);
      const pathDir = path.dirname(destinationPath);
      const candidate = path.join(pathDir, newFileName);

      try {
        //   Пробуем скопировать с новым именем
        fse.copySync(sourcePath, candidate, copyOptions);
      } catch (err) {
        console.log(err)
        throw err;
      }
    } else {
      throw error;
    }
  }
}

function getNameWithCopiesCount(filePath) {
  // file.txt -> file - копия (1).txt

  const pathDir = path.dirname(filePath);
  const extension = path.extname(filePath);
  const fileName = path.basename(filePath, extension);

  // Сколько копий этого файла уже есть в папке
  const copiesCount = getCountOfCopies(pathDir, fileName);

  const newFileName = `${fileName} - копия(${copiesCount})${extension}`;
  return newFileName;
}

function getCountOfCopies(directoryPath, fileName) {
  const files = fs.readdirSync(directoryPath);

  // Выбираем файлы, названия которых содержат `... - копия`
  const copies = files.filter((file) => file.includes(`${fileName} - копия`));
  return copies.length;
}
