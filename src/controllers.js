import drivelist from "drivelist";
import fs from "fs";
import path from "path";

function getFileType(file) {
    if (file.isDirectory()) {
        return 'folder'
    } else if (file.isFile()) {
        return 'file'
    } 
}

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
            extension: path.extname(currentFilePath),
            type: getFileType(file)
        }

        try {
            const fileStats = fs.statSync(currentFilePath)
            console.log(file.name, fileStats)
            fileData.last_modified = fileStats.mtime || fileStats.ctime
            fileData.size = fileStats.size
        } catch (err) {

            console.log(err)
        } finally {
            filesData.push(fileData)
        }

    })
    return res.json(filesData);
  } catch (err) {
      console.log(err)
    return res.status(404).json({ message: "No such directory" });
  }
}
