const Primus = require('primus');

const url = "wss://demo.piesocket.com/v3/channel_123?api_key=VCXCEuvhGcBDP7XhiJJUDvR1e1D3eiVjgZ9VRiaV&notify_self"

const socket = new Primus(url, {
    manual: true,
    reconnect: {
        max: 5000,
        min: 500,
        retries: 10
    },
    strategy: "disconnect,timeout",
    transformer: "engine.io",
    transport: {
        // agent:
    }
});
socket.on('open', () => {
    console.log('Connected to Primus server');
});

socket.on('data', (data) => {
    console.log('Received data from Primus server:', data);
});

socket.on('error', (err) => {
    console.error('Error connecting to Primus server:', err);
});
