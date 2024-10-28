const borRouter = require('../router/bot')
const zoomApi = require("../api/zoomAPI");

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


module.exports = {
    getZoomSignature,
    getZoomAPIAccessToken,
    getUserInfo
};