const express = require('express')
const router = express.Router()
const {getZoomSignature, getZoomAPIAccessToken, getUserInfo, getCollaborationDevices, sendMessageToAI} = require('../controller/bot')

router.get('/', getZoomAPIAccessToken)
router.post('/get-signature', getZoomSignature)
router.get('/get-user', getUserInfo)
router.get('/get-collaboration-devices', getCollaborationDevices)
router.get('/test', sendMessageToAI)

module.exports = router