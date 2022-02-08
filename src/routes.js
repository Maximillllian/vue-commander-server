import { Router } from 'express'
import * as controllers from './controllers.js'

const router = Router()

router.get('/drives', controllers.getDrives)
router.post('/open-folder', controllers.openFolder)
router.post('/open-file-native', controllers.openFileNative)
router.post('/back', controllers.getParentFolder)

export default router;