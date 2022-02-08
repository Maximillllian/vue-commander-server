import path from 'path'
import fs from 'fs'

const { imageExtensions, audioExtensions, videoExtensions, textExtensions } = JSON.parse(fs.readFileSync(path.resolve('src', 'extensions.json')))

function detectFileTypeByExtension(file) {
    const fileSplitedByDot = file.name.split('.')
    const extension = fileSplitedByDot[fileSplitedByDot.length - 1]

    if (!extension) {
        return 'file'
    } else if (imageExtensions.includes(extension)) {
        return 'image'
    } else if (audioExtensions.includes(extension)) {
        return 'audio'
    } else if (videoExtensions.includes(extension)) {
        return 'video'
    } else if (textExtensions.includes(extension)) {
        return 'text'
    }
    return 'file'
}

export function getFileType(file) {
    if (file.isDirectory()) {
        return 'folder'
    } else if (file.isFile()) {
        return detectFileTypeByExtension(file)
    } 
}

export function isRoot(folderPath) {
    const parentPath = path.resolve(folderPath, '..')
    return parentPath === folderPath
}