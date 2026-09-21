class SocketService {
    constructor() {
        Object.defineProperty(this, "ws", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "listeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "reconnectAttempts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "isConnecting", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
    }
    connect() {
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
            return;
        }
        this.isConnecting = true;
        const wsUrl = import.meta.env.VITE_WS_URL;
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname === 'localhost'
            ? 'localhost:5000'
            : window.location.host;
        const url = wsUrl || `${protocol}//${host}`;
        try {
            this.ws = new WebSocket(url);
            this.ws.onopen = () => {
                this.reconnectAttempts = 0;
                this.isConnecting = false;
                console.log('⚡ Connected to ResQAuto WebSocket Stream');
                this.emit('connection:status', { connected: true });
            };
            this.ws.onmessage = (event) => {
                try {
                    const { event: evt, data } = JSON.parse(event.data);
                    this.emit(evt, data);
                }
                catch (e) {
                    console.error('Failed to parse WebSocket message', e);
                }
            };
            this.ws.onclose = () => {
                this.isConnecting = false;
                this.emit('connection:status', { connected: false });
                this.scheduleReconnect();
            };
            this.ws.onerror = (err) => {
                console.warn('WebSocket connection error:', err);
            };
        }
        catch (e) {
            this.isConnecting = false;
            this.scheduleReconnect();
        }
    }
    scheduleReconnect() {
        this.reconnectAttempts++;
        const delay = Math.min(5000, 1000 * Math.pow(1.5, this.reconnectAttempts));
        setTimeout(() => {
            this.connect();
        }, delay);
    }
    on(event, handler) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(handler);
        return () => this.off(event, handler);
    }
    off(event, handler) {
        const handlers = this.listeners.get(event);
        if (handlers) {
            handlers.delete(handler);
        }
    }
    emit(event, data) {
        const handlers = this.listeners.get(event);
        if (handlers) {
            handlers.forEach(handler => handler(data));
        }
        // Also notify global wildcard listeners
        const allHandlers = this.listeners.get('*');
        if (allHandlers) {
            allHandlers.forEach(handler => handler({ event, data }));
        }
    }
    send(event, data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ event, data }));
        }
    }
    // Built-in Web Audio Sound FX for notifications
    playAlertSound(type = 'radar') {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx)
                return;
            const ctx = new AudioCtx();
            if (type === 'radar') {
                // High alert ping
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
                osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15); // A6
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            }
            else if (type === 'arrival') {
                // Pleasant double chime
                [523.25, 659.25, 783.99].forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
                    gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.12);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.12 + 0.35);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(ctx.currentTime + idx * 0.12);
                    osc.stop(ctx.currentTime + idx * 0.12 + 0.35);
                });
            }
        }
        catch (e) {
            // Audio context might be restricted before user gesture
        }
    }
}
export const socketService = new SocketService();
