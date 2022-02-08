import drivelist from "drivelist";
import fs from "fs";
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