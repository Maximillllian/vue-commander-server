import drivelist from "drivelist";
import fs from "fs";
import fse from 'fs-extra'
import path from "path";
import open from 'open'
import { getFileType, isRoot } from './utils.js'

export async function getDrives(req, res) {
  try {
    const rawDrives = await drivelist.list();
    const drivesNames = rawDrives.flatMap((drive) => drive.mountpoints);
    return res.json(drivesNames);
  } catch (err) {
    return res.status(500).json({ message: "Disk read error" });
  }
}

export async function openFolder(req, res) {
  try {
    const folderPath = req.body.path;
    const files = fs.readdirSync(folderPath, { withFileTypes: true });
    let filesData = []
    files.forEach(file => {
        const currentFilePath = path.resolve(folderPath, file.name)
        let fileData = {
            name: file.name,
            path: currentFilePath,
            is_directory: file.isDirectory(),
            is_file: file.isFile(),
            extension: '',
            type: getFileType(file)
        }

        if (file.isFile()) {
            fileData.extension = path.extname(currentFilePath)
        }

        try {
            const fileStats = fs.statSync(currentFilePath)
            fileData.last_modified = fileStats.mtime || fileStats.ctime
            fileData.size = fileStats.size
        } catch (err) {
            // console.log(err)
        } finally {
            filesData.push(fileData)
        }

    })
    return res.json({filesData, isRoot: isRoot(folderPath)});
  } catch (err) {
      console.log(err)
    return res.status(404).json({ message: "No such directory" });
  }
}

export async function openFileNative(req, res) {
    try {
        const filePath = req.body.path;
        await open(path.resolve(filePath))
        res.json({
            message: "Succesfully open"
        })
    } catch (err) {
        res.status(500).json({
            message: "Error open file"
        })
    }
}

export async function getParentFolder(req, res) {
    try {
        const currentPath = req.body.path;
        const parentFolderPath = path.resolve(currentPath, '..')
        return res.json(parentFolderPath)
    } catch (err) {

    }
}

export function deleteFiles(req, res) {
    try {
        const pathsForDelete = req.body.paths;
        pathsForDelete.forEach(filePath => {
            fs.rmSync(filePath, { recursive: true, force: true });
        })
        return res.json({
            message: 'Files succesfully deleted'
        })
    } catch (err) {
        console.log(err)
    }
}

export function copyFiles(req, res) {
    try {
        const { files } = req.body;
        files.forEach(file => {
            fse.copySync(file.sourcePath, file.destinationPath);
        })
        return res.json({
            message: 'Files succesfully copied'
        })
    } catch (err) {
        res.status(404).json({
            message: 'Ошибка при копировании файлов, проверьте путь'
        })
    }
}

export function moveFiles(req, res) {
    try {
        const { files } = req.body;
        files.forEach(file => {
            fs.renameSync(file.sourcePath, file.destinationPath);
        })
        return res.json({
            message: 'Files succesfully moved'
        })
    } catch (err) {
        console.log(err)
        res.status(404).json({
            message: 'Ошибка при перемещении файлов, проверьте путь'
        })
    }
}