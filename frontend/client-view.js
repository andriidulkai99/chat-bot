ZoomMtg.setZoomJSLib('https://source.zoom.us/3.9.2/lib', '/av')

ZoomMtg.preLoadWasm()
ZoomMtg.prepareWebSDK()
// loads language files, also passes any error messages to the ui
ZoomMtg.i18n.load('en-US')
ZoomMtg.i18n.reload('en-US')

let transcription = ''
const meetingNumber = "99861126910";
const meetingPassword = "xju8XitIpujNvzhiJgQPndMR50yd08.1";
const userId = "RGkVRpEVR82bYwxHM8Qf4g"

async function startAudioStreaming(blob) {
    // Підключення до WebSocket

    const socket = io("ws://localhost:3001/")
    socket.binaryType = 'arraybuffer';

    // Обробка подій WebSocket
    socket.onopen = async () => {
    };

    socket.on('get audio', (msg) => {
        console.log('Message received: ' + msg);
    });
    const formData = new FormData();
    formData.append('file', blob, 'audio.webm');
    console.log(formData)
    socket.emit('chat message', blob)
}

const recordingAudio = async () => {
    let mediaRecorder;
    let audioChunks = [];

    await navigator.getUserMedia({
        audio: true
    }, function(stream) {
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.webm');

            const {data} = await axios.post('http://localhost:3001/file', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Додаємо заголовок
                },
            })
            transcription = data.transcription;

            console.log(userId)
            try {
                ZoomMtg.getAttendeeslist({
                    success: function (res) {
                        console.log(res); // Тут шукайте потрібний ID
                    },
                    error: function (err) {
                        console.log(err);
                    }
                });
                ZoomMtg.sendChat({
                    message: 'test4',
                    userId: 16778240,
                    success: function (){
                        console.log('test4')
                    },
                    error: function (e) {
                        console.log(e)
                        console.log('iQicvz4ZSBqy2ng9Hi39HA')
                    }
                })
            } catch (e) {
                console.log(e)
            }
        };

        mediaRecorder.start();

        setInterval(() => {
            if (mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
                mediaRecorder.start();
            }
        }, 5000);
    }, function(error) {
        console.error(JSON.stringify(error));
    });
}
async function startMeeting() {

    fetch('http://localhost:3001/bot/get-signature', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ meetingId: meetingNumber, role: 0 }), // Замість '123456789' вкажіть реальний ID
    })
        .then(response => {
            if (response.ok) {
                return response.json(); // Читаємо тіло відповіді як JSON
            } else {
                throw new Error('Network response was not ok.');
            }
        })
        .then(async data => {
            document.getElementById('zmmtg-root').style.display = 'block'
            console.log(data.signature)
            await recordingAudio()
            ZoomMtg.init({
                leaveUrl: 'https://example.com/thanks-for-joining',
                isSupportAV: true,
                disablePreview: true,
                success: () => {
                    ZoomMtg.join({
                        sdkKey: "NBwzDANS8C1WoqZREQD9w",
                        signature: data.signature, // role in SDK signature needs to be 0
                        meetingNumber: meetingNumber,
                        passWord: meetingPassword,
                        userName: "zoom bot",
                        success: async (success) => {
                            await recordingAudio()
                        },
                        error: (error) => {
                            console.log(error)
                        },
                    })
                },
                error: (error) => {
                    console.error('Init error', error);
                },
            });

            // ZoomMtg.inMeetingServiceListener('onMediaCapturePermissionChange', function({allow}){
            //     if(allow) {
            //         ZoomMtg.mediaCapture("start")
            //     }
            // })
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
}