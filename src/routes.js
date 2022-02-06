import { Router } from 'express'
import * as controllers from './controllers.js'

const router = Router()

router.get('/drives', controllers.getDrives)
router.post('/open-folder', controllers.openFolder)

export default router;