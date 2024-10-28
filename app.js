const express = require('express');
const axios = require('axios');
const cors = require("cors");
const querystring = require('querystring');
const bot = require('./router/bot');
const { Server } = require('socket.io');
const http = require("http");
const { createClient, LiveTranscriptionEvents} = require('@deepgram/sdk');
const {transcribeAudio} = require("./api/deepgram");
require('dotenv').config();
const multer  = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const deepgram = createClient(process.env.DEEP_GRAM_KEY);

const app = express();
var port = process.env.PORT || '3001';

app.use(cors());
app.use(express.json());

var server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Дозволяє підключення з будь-якого джерела
        methods: ['GET', 'POST'], // Дозволені HTTP методи
    }
});

io.on('connection', (socket) => {
    console.log(socket.id);

    socket.on('chat message', (data) => {
        console.log("Отримані дані:", data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const zoomClientID = process.env.ZOOM_CLIENT_ID;
const zoomClientSecret = process.env.ZOOM_CLIENT_SECRET;
const redirectUri = process.env.ZOOM_REDIRECT_URI;

app.use('/bot', bot);
app.get('/success', (req, res) => {
    res.status(200).send('success');
})
app.post('/file', upload.single('file'), async (req,res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        // Транскрибуємо аудіо з буфера
        const { result, error } = await deepgram.listen.prerecorded.transcribeFile(req.file.buffer, {
            model: 'nova', // Вкажіть модель, яку хочете використовувати
            punctuate: true, // Додати розділові знаки
        });

        if (error) {
            console.error('Error during transcription:', error);
            return res.status(500).send('Error processing audio');
        }

        // Відправляємо транскрипцію клієнту
        console.log('Transcription result:', result);
        console.log('------------------')
        console.log(result.results.channels)
        console.log('----------------------')
        console.log(result.results.channels[0].alternatives)

        const text = result.results.channels[0].alternatives[0].transcript
        res.status(200).json({ transcription: text });
    } catch (err) {
        console.error('Unexpected error:', err);
        res.status(500).send('Unexpected error occurred');
    }
})

server.listen(port);
