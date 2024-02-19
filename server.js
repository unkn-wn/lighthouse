process.env.GOOGLE_APPLICATION_CREDENTIALS = './serviceAccount.json';
const admin = require('firebase-admin');
const cors = require('cors');
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
//const cron = require('node-cron');
//const { OpenAI } = require("openai");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://stock-sim-c17d8.firebaseio.com'
});

const db = admin.firestore();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    //origin: "*",
    methods: ["GET", "POST"]
  }
});
const port = 3000;
let latestHeadlinesGlobal = {};

let stocks = {
    'CRNB': { name: 'Cranberry Inc.', price: 150, category: 'Consumer Tech' },
    'MCH': { name: 'McHenry\'s Corp.', price: 300, category: 'Fast Food' },
    'QTR': { name: 'Quitter Inc.', price: 45, category: 'Social Media' },
    'SRC': { name: 'Specific Rotors Company', price: 30, category: 'Automotive' },
    'GOGGL': { name: 'Goggle Inc.', price: 140, category: 'Consumer Tech' },
    'WBFX': { name: 'Webflix Inc.', price: 500, category: 'Entertainment' },
    'EDSN': { name: 'Edison Inc.', price: 200, category: 'Automotive' },
    'PKT': { name: 'Pinkit Inc.', price: 120, category: 'Social Media' },
    'BUR': { name: 'Burrito Gong Corp.', price: 55, category: 'Fast Food' },
    'TKC': { name: 'This Knee Company.', price: 90, category: 'Entertainment' }
};

async function fetchCurrentPricesFromFirestore() {
  try {
    const stocksSnapshot = await db.collection('stocks').get();
    stocksSnapshot.forEach(doc => {
      const stockData = doc.data();
      if (stocks[doc.id]) {
        stocks[doc.id].price = stockData.currentPrice;
      }
    });
    console.log('Stocks updated with current prices from Firestore:', stocks);
  } catch (error) {
    console.error('Error fetching current prices from Firestore:', error);
    throw error; // Throw error to prevent the server from starting
  }
}

async function initializeServer() {
  await fetchCurrentPricesFromFirestore();

  app.use(cors({
    origin: 'http://localhost:3000', // or '*' to allow all origins
    //origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  app.get('/stock/:id', async (req, res) => {
    const stockId = req.params.id;
    if (stocks[stockId]) {
      res.json({ id: stockId, ...stocks[stockId] });
    } else {
      res.status(404).send('Stock not found');
    }
  });
  io.on('connection', (socket) => {
    console.log('A user connected');
  
    // Emit the current stocks object immediately after a client connects
    socket.emit('stock update', stocks);
  
    // Optionally, if you want to emit updates periodically or based on some event
    // setInterval(() => {
    //   socket.emit('stock update', stocks);
    // }, 10000); // every 10 seconds
  
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
  server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
}
initializeServer();
