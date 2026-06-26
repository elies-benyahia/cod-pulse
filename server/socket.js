const { Server } = require('socket.io');

let io = null;

function initSocket(httpServer) {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('[SOCKET] Client connected:', socket.id);

    // Envoyer l'état actuel du live dès la connexion
    sendLiveState(socket);

    socket.on('disconnect', () => {
      console.log('[SOCKET] Client disconnected:', socket.id);
    });
  });

  return io;
}

function getIO() {
  return io;
}

// Broadcast un match live à tous les clients connectés
function broadcastMatchUpdate(matchData) {
  if (io) {
    io.emit('match:update', matchData);
  }
}

// Envoyer l'état actuel à un socket spécifique
function sendLiveState(socket) {
  // Pour l'instant, on envoie null (pas de match en cours)
  // Sera remplacé par une vraie source de données
  socket.emit('match:update', null);
}

module.exports = { initSocket, getIO, broadcastMatchUpdate };
