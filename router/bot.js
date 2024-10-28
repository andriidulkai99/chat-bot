const express = require('express')
const router = express.Router()
const {getZoomSignature, getZoomAPIAccessToken, getUserInfo} = require('../controller/bot')

router.get('/', getZoomAPIAccessToken)
router.post('/get-signature', getZoomSignature)
router.get('/get-user', getUserInfo)

module.exports = router