import { websocketserver } from 'ws';

const port: number = 12345;

const wss = new websocketserver.Server({ port: port });

wss.on('connection', (ws: websocketserver) => {
    ws.on('connect', () => {
        console.log('Client connected');
    });
    ws.on('message', (data: any) => {
        console.log('received: %s', data);
        ws.send(`Hello, you sent -> ${data}`);
    });
    ws.send('Hi there, I am a WebSocket server');
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});