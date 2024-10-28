ZoomMtg.setZoomJSLib('https://source.zoom.us/3.9.2/lib', '/av')

ZoomMtg.preLoadWasm()
ZoomMtg.prepareWebSDK()
// loads language files, also passes any error messages to the ui
ZoomMtg.i18n.load('en-US')
ZoomMtg.i18n.reload('en-US')

let transcription = ''
const meetingNumber = "99216197988";
const meetingPassword = "EorXsZXstejp9t0MAzabuyxYKLrbbB.1";
const userName = 'Andrii Dulkai'

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

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
        // Створюємо Blob з аудіо і відправляємо його на сервер
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');

        // Відправлення запису на бекенд
        try {
            const { data } = await axios.post('http://localhost:3001/file', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const transcription = data.transcription;
            audioChunks = []; // Очищення масиву після надсилання

            // Обробка результатів Zoom API
            ZoomMtg.getAttendeeslist({
                success: function (e) {
                    const user = e.result.attendeesList.find(el => el.userName === userName);

                    if (transcription.length > 0) {
                        ZoomMtg.sendChat({
                            message: transcription,
                            userId: user.userId,
                            success: function () { console.log('Message sent'); },
                            error: function (e) { console.error(e); },
                        });
                    }
                },
                error: function (err) { console.error(err); },
            });
        } catch (error) {
            console.error('Error sending audio:', error);
        }
    };

    // Початок запису
    mediaRecorder.start();

    // Кожні 60 секунд зупиняємо та знову запускаємо запис
    setInterval(() => {
        if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();  // Зупиняємо запис, що тривав 60 секунд
            mediaRecorder.start(); // Починаємо новий запис
        }
    }, 60000); // 60000 мс = 60 секунд
}

function playRecordedAudio(audioBlob) {
    if (audioBlob) {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
    } else {
        console.log('Аудіо не записано');
    }
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