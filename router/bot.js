const express = require('express')
const router = express.Router()
const {auth} = require('../middleware/auth')
const {getZoomSignature, getZoomAPIAccessToken, getRecord, getUserInfo,getMeetingInfo,jointBotToMeeting,  getCollaborationDevices,getToken, sendMessageToAI, getAccessForRecording} = require('../controller/bot')

router.get('/', getZoomAPIAccessToken)
router.get('/auth', getToken)
router.post('/get-signature', getZoomSignature)
router.post('/get-user', getUserInfo)
router.post('/get-access-for-recording', getAccessForRecording)
router.post('/get-record', getRecord)
router.post('/get-meeting-info', getMeetingInfo)
router.get('/connect-bot', jointBotToMeeting)

module.exports = router