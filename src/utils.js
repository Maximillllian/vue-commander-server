import path from "path";
import fs from "fs";
import fse from "fs-extra";

const { imageExtensions, audioExtensions, videoExtensions, textExtensions } =
  JSON.parse(fs.readFileSync(path.resolve("src", "extensions.json")));

function detectFileTypeByExtension(file) {
  const fileSplitedByDot = file.name.split(".");
  const extension = fileSplitedByDot[fileSplitedByDot.length - 1];

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

export function getFileType(file) {
  if (file.isDirectory()) {
    return "folder";
  } else if (file.isFile()) {
    return detectFileTypeByExtension(file);
  }
}

export function isRoot(folderPath) {
  const parentPath = path.resolve(folderPath, "..");
  return parentPath === folderPath;
}

export function copyWithoutOverwrite(sourcePath, destinationPath) {
  try {
    //   Пробуем скопировать
    fse.copySync(sourcePath, destinationPath, {
      overwrite: false,
      errorOnExist: true,
    });
    return true;
  } catch (error) {
    if (error.message.includes("already exists")) {
      // Если ловим ошибку, что такой файл существует, добавляем '- копия (n)'
      const pathDir = path.dirname(destinationPath);
      const extension = path.extname(destinationPath);
      const fileName = path.basename(destinationPath, extension);

      const copiesCount = fs
        .readdirSync(pathDir)
        .filter((file) => file.includes(`${fileName} - копия`)); // Сколько копий этого файла уже в папке
      const candidate = path.join(
        pathDir,
        `${fileName} - копия(${copiesCount.length})${extension}`
      );

      try {
        //   Пробуем скопировать с новым именем
        fse.copySync(sourcePath, candidate, {
          overwrite: false,
          errorOnExist: true,
        });
      } catch (err) {
        console.log(err);
        throw err;
      }
      return false;
    }
    throw error;
  }
}
