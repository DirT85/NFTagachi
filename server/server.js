const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const players = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (playerData) => {
        console.log('Player joining with data:', playerData);
        const player = {
            id: socket.id,
            name: playerData.name,
            x: playerData.x,
            y: playerData.y,
            monsterId: playerData.monsterId,
            variant: playerData.variant,
            spriteSheet: playerData.spriteSheet, // Sync the art
            baseStats: playerData.baseStats,
            state: 'IDLE',
            lastSeen: Date.now()
        };
        players.set(socket.id, player);
        console.log('Total players in lobby:', players.size);

        // Broadcast to all that a new player joined
        socket.broadcast.emit('playerJoined', player);
        console.log('Broadcasted playerJoined to other clients');

        // Send current players to the newcomer
        socket.emit('currentPlayers', Array.from(players.values()));
        console.log('Sent currentPlayers to newcomer:', Array.from(players.values()).map(p => p.name));
    });

    socket.on('move', (moveData) => {
        const player = players.get(socket.id);
        if (player) {
            player.x = moveData.x;
            player.y = moveData.y;
            player.state = moveData.state;
            player.lastSeen = Date.now();
            socket.broadcast.emit('playerMoved', player);
        }
    });

    socket.on('chat', (message) => {
        socket.broadcast.emit('playerChat', { id: socket.id, message });
    });

    socket.on('challenge', (targetId) => {
        console.log(`Challenge from ${socket.id} to ${targetId}`);
        io.to(targetId).emit('challenged', {
            challengerId: socket.id,
            challengerName: players.get(socket.id)?.name,
            monster: players.get(socket.id) // Includes monsterId, variant, etc.
        });
    });

    socket.on('acceptChallenge', (challengerId) => {
        io.to(challengerId).emit('challengeAccepted', {
            opponentId: socket.id,
            opponentName: players.get(socket.id)?.name,
            monster: players.get(socket.id)
        });
    });

    socket.on('battleAction', ({ targetId, action, success }) => {
        io.to(targetId).emit('opponentAction', { action, success });
    });

    socket.on('calculate_result', ({ targetId, damage, chargeSpecial, message }) => {
        io.to(targetId).emit('turn_result', { damage, chargeSpecial, message });
    });

    socket.on('forfeit', ({ targetId }) => {
        io.to(targetId).emit('battleEnded', { win: true, reason: 'Opponent Forfeited' });
    });

    socket.on('battleEnd', ({ targetId, win }) => {
        io.to(targetId).emit('battleEnded', { win: !win });
    });

    socket.on('leave', () => {
        players.delete(socket.id);
        io.emit('playerLeft', socket.id);
        io.emit('playerCountUpdate', players.size);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        players.delete(socket.id);
        io.emit('playerLeft', socket.id);
        io.emit('playerCountUpdate', players.size);
    });
});

// Robust Cleanup: Every 10 seconds, purge stale players (no activity for 2 minutes)
setInterval(() => {
    const now = Date.now();
    let changed = false;
    for (const [id, player] of players.entries()) {
        if (now - player.lastSeen > 120000) { // 2 minutes
            console.log('Purging ghost player:', id);
            players.delete(id);
            changed = true;
        }
    }
    if (changed) {
        io.emit('currentPlayers', Array.from(players.values()));
        io.emit('playerCountUpdate', players.size);
    }
}, 10000);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Lobby Server running on port ${PORT}`);
});
