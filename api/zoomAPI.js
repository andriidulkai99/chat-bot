require("dotenv").config();
const axios = require("axios");
const btoa = require("btoa");
const jwt = require('jsonwebtoken');
const KJUR = require('jsrsasign')
const stream = require("node:stream");
const getZoomAPIAccessToken = async () => {
    try {
        const base_64 = btoa(process.env.ZOOM_CLIENT_ID + ":" + process.env.ZOOM_CLIENT_SECRET);

        const resp = await axios({
            method: "POST",
            url:
                "https://zoom.us/oauth/token",
            headers: {
                Authorization: "Basic " + `${base_64}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            data: {
                grant_type: "account_credentials",
                account_id: process.env.ZOOM_ACCOUNT_ID
            }

        });
        //
        return resp.data;
    } catch (err) {
        // Handle Error Here
        console.error(err);
    }
};

const getAccessToken = async (code ) => {
    try {
        const base_64 = btoa(process.env.ZOOM_MEETING_SDK_KEY + ":" + process.env.ZOOM_MEETING_SDK_SECRET);

        const resp = await axios({
            method: "POST",
            url:
                "https://zoom.us/oauth/token",
            headers: {
                Authorization: "Basic " + `${base_64}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            data: {
                grant_type: "authorization_code",
                code: code,
                redirect_uri: "https://1f80-94-154-212-157.ngrok-free.app/auth/callback"
            }

        });

        console.log(resp.data)
        //
        return {
            access_token: resp.data.access_token,
            refresh_token: resp.data.refresh_token
        };
    } catch (err) {
        // Handle Error Here
        console.error(err);
    }
};

const getAccessForRecording = async (token, meetingId) => {
    try {
        const resp = await axios({
            method: "GET",
            url:
                `https://api.zoom.us/v2/meetings/${meetingId}/jointoken/local_recording`,
            headers: {
                Authorization: "Bearer " + `${token}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
        });
        return resp.data;
    } catch (err) {
        // Handle Error Here
        console.error(err);
    }
};

const getMeetingInfo = async (token, meetingId) => {
    try {
        const resp = await axios({
            method: "GET",
            url:
                `https://api.zoom.us/v2/meetings/${meetingId}/`,
            headers: {
                Authorization: "Bearer " + `${token}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
        });
        return resp.data;
    } catch (err) {
        // Handle Error Here
        console.error(err);
    }
};

const getRecords = async (token, userId) => {
    try {
        const resp = await axios({
            method: "GET",
            url:
                `https://api.zoom.us/v2/users/${userId}/records`,
            headers: {
                Authorization: "Bearer " + `${token}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
        });
        return resp.data;
    } catch (err) {
        // Handle Error Here
        console.error(err);
    }
};

const getCollaborationDevices = async (token) => {
    try {
        const resp = await axios({
            method: "GET",
            url:
                "https://api.zoom.us/v2/users/me/collaboration_devices",
            headers: {
                Authorization: "Bearer " + `${token}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
        });
        return resp.data;
    } catch (err) {
        // Handle Error Here
        console.error(err);
    }
};

const getUserDetails = async (token) => {
    try {
        const resp = await axios({
            method: "GET",
            url:
                "https://api.zoom.us/v2/users/me",
            headers: {
                Authorization: "Bearer " + `${token}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
        });
        return resp.data;
    } catch (err) {
        // Handle Error Here
        console.error(err);
    }
};

const getAppUserEntitlements = async (token, userId) => {
    const params = {}

    if(userId) {
        params.userId = userId;
    }

    try {
        const resp = await axios({
            method: "GET",
            url:
                "https://api.zoom.us/v2/marketplace/monetization/entitlements",
            headers: {
                Authorization: "Bearer " + `${token}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            params: params,
        });
        return resp.data;
    } catch (err) {
        // Handle Error Here
        console.error(err);
    }
};

function generateSignature(key, secret, meetingNumber, role) {

    const iat = Math.round(new Date().getTime() / 1000) - 30
    const exp = iat + 60 * 60 * 2
    const oHeader = { alg: 'HS256', typ: 'JWT' }

    const oPayload = {
        sdkKey: key,
        appKey: key,
        mn: meetingNumber,
        role: role,
        iat: iat,
        exp: exp,
        tokenExp: exp
    }

    const sHeader = JSON.stringify(oHeader)
    const sPayload = JSON.stringify(oPayload)
    const sdkJWT = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, secret)
    return sdkJWT
}

module.exports = {
    getZoomAPIAccessToken,
    generateSignature,
    getUserDetails,
    getCollaborationDevices,
    getAccessForRecording,
    getMeetingInfo,
    getAccessToken,
    getRecords
};