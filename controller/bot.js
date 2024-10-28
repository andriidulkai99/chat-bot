const borRouter = require('../router/bot')
const zoomApi = require("../api/zoomAPI");
const openai = require("../api/openai");

const getZoomSignature = async (req, res) => {
    const { meetingId, role } = req.body;
    const signature = await zoomApi.generateSignature( process.env.ZOOM_MEETING_SDK_KEY, process.env.ZOOM_MEETING_SDK_SECRET,meetingId, role)
    res.status(200).send({
        signature: signature
    })
}

const getZoomAPIAccessToken = async (req, res) => {
    const token = await zoomApi.getZoomAPIAccessToken()
    res.send(token)
}

const getUserInfo = async (req, res) => {
    const token = await zoomApi.getZoomAPIAccessToken()
    const user = await zoomApi.getUserDetails(token)
    res.send(user)
}

const getCollaborationDevices = async (req, res) => {
    const token = await zoomApi.getZoomAPIAccessToken()
    const user = await zoomApi.getCollaborationDevices(token)
    res.send(user)
}

const sendMessageToAI = async (req, res) => {
    const test = await openai.sendMessageToAI('Hello world!','test')
    res.send(test)
}


module.exports = {
    getZoomSignature,
    getZoomAPIAccessToken,
    getUserInfo,
    getCollaborationDevices,
    sendMessageToAI
};