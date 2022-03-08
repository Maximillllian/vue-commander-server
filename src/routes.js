import { Router } from 'express'
import * as controllers from './controllers.js'

const router = Router()

router.get('/drives', controllers.getDrives)
router.post('/get-folder', controllers.getFolder)
router.post('/open-file-native', controllers.openFileNative)
router.get('/parent-folder', controllers.getParentFolder)
router.post('/delete', controllers.deleteFiles)
router.post('/copy', controllers.copyFiles)
router.post('/move', controllers.moveFiles)
router.post('/rename', controllers.rename)

export default router;