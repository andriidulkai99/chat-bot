const borRouter = require('../router/bot')
const zoomApi = require("../api/zoomAPI");
const openai = require("../api/openai");
const bot = require("../api/bot")

const getZoomSignature = async (req, res) => {
    try {
        const { meetingId, role } = req.body;
        const signature = await zoomApi.generateSignature( process.env.ZOOM_MEETING_SDK_KEY, process.env.ZOOM_MEETING_SDK_SECRET,meetingId, role)
        res.status(200).send({
            signature: signature
        })
    } catch (e) {
        res.status(500).send({
            message: 'Internal server error'
        })
    }
}

const getZoomAPIAccessToken = async (req, res) => {
    try {
        const data = await zoomApi.getZoomAPIAccessToken()
        res.send(data)
    } catch (e) {
        res.status(500).send({
            message: 'Internal server error'
        })
    }
}

const getToken = async (req, res) => {
    try {
        const {code} = req.query
        const {access_token,refresh_token} = await zoomApi.getAccessToken(code)
        res.send({
            token: access_token,
            refresh_token
        })
    } catch (e) {
        res.status(500).send({
            message: 'Internal server error'
        })
    }
}

const getUserInfo = async (req, res) => {
    try {
        const token = req['authorization'];
        const user = await zoomApi.getUserDetails(token)
        res.send(user)
    } catch (e) {
        res.status(500).send({
            message: 'Internal server error'
        })
    }
}

const getAccessForRecording = async (req, res) => {
    try {
        const {meetingId} = req.body;

        const token = req['authorization'];

        const user = await zoomApi.getAccessForRecording(token, meetingId)
        res.send(user)
    } catch (e) {
        res.status(500).send({
            message: 'Internal server error'
        })
    }
}

const getMeetingInfo = async (req, res) => {
    try {
        const {meetingId} = req.body;
        const token = req['authorization'];
        const user = await zoomApi.getMeetingInfo(token, meetingId)
        res.send(user)
    } catch (e) {
        res.status(500).send({
            message: 'Internal server error'
        })
    }
}

const jointBotToMeeting = async (req, res) => {
    await bot.joinMeetingBot()
    console.log("Clicked button and waiting for navigation");
    return res.send({
        status: 'success'
    })
}

const getRecord = async (req, res) => {
    try {
        const {userId} = req.body;
        const token = req['authorization'];
        const user = await zoomApi.getRecords(token, userId)
        res.send(user)
    } catch (e) {
        res.status(500).send({
            message: 'Internal server error'
        })
    }
}


module.exports = {
    getZoomSignature,
    getZoomAPIAccessToken,
    getUserInfo,
    getAccessForRecording,
    getMeetingInfo,
    getToken,
    getRecord,
    jointBotToMeeting
};