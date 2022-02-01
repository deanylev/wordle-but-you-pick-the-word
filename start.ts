// node libraries
import { AddressInfo } from 'net';

// our libraries
import wordList from './frontend/src/globals/wordList';

// third party libraries
import cors from 'cors';
import express from 'express';
import { createConnection, RowDataPacket } from 'mysql2/promise';
import { booleanP, objectP, stringP } from 'type-proxy';
import { v4 } from 'uuid';

// constants
const SHORT_LENGTH = 6;

const [host, dbPort] = (process.env.DB_HOST ?? 'localhost').split(':');
const parsedDbPort = parseInt(dbPort ?? '3306', 10);

(async () => {
  const connection = await createConnection({
    host,
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASS ?? '',
    database: process.env.DB_NAME ?? 'wordle_but_you_pick_the_word',
    port: parsedDbPort
  });

  connection.execute(
    `
      CREATE TABLE IF NOT EXISTS words (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        short VARCHAR(10) NOT NULL,
        word VARCHAR(10) NOT NULL,
        real_words TINYINT(1) NOT NULL,
        UNIQUE KEY UQ_words_word_real_words (word, real_words)
      );
    `.trim()
  );

  // db keepalive
  setInterval(() => connection.execute('SELECT 1'), 5000);

  const app = express();
  app.use(express.json());

  if (process.env.NODE_ENV !== 'production') {
    app.use(cors());
  }

  app.use(express.static('frontend/build'));

  function generateShort() {
    return Math.random().toString(36).slice(2, SHORT_LENGTH + 2);
  }

  const createBodyP = objectP({
    realWords: booleanP,
    word: stringP
  });

  app.post('/api/words', async (req, res) => {
    try {
      const bodyResult = createBodyP(req.body);
      if (!bodyResult.success) {
        res.sendStatus(400);
        return;
      }

      const { realWords: rawRealWords, word: rawWord } = bodyResult.value;
      const realWords = rawRealWords ? 1 : 0;
      const word = rawWord.toLowerCase();
      if (!/^[a-z]{5}$/.test(word) || rawRealWords && !wordList.includes(word)) {
        res.sendStatus(400);
        return;
      }

      const existingResult = await connection.execute('SELECT short FROM words WHERE word = ? AND real_words = ?', [word, realWords]);
      const existingRecord = (existingResult[0] as RowDataPacket[])[0];

      if (existingRecord) {
        res.json({
          short: existingRecord.short
        });
      } else {
        let short;

        do {
          short = generateShort();
        } while (((await connection.execute('SELECT COUNT(1) FROM words WHERE short = ?', [short]))[0] as RowDataPacket[])[0]['COUNT(1)']);

        await connection.execute('INSERT INTO words (id, short, word, real_words) VALUES (?, ?, ?, ?)', [v4(), short, word, realWords]);
        res.json({
          short
        });
      }
    } catch (error) {
      console.error('error during creation', {
        error
      });
      res.sendStatus(500);
    }
  });

  app.get('/api/words/:short', async (req, res) => {
    const { short } = req.params;
    const result = await connection.execute('SELECT real_words, word FROM words WHERE short = ?', [short]);
    const record = (result[0] as RowDataPacket[])[0];
    if (!record) {
      res.sendStatus(404);
      return;
    }

    res.json({
      realWords: !!record.real_words,
      word: record.word
    });
  });

  app.get('*', (req, res) => {
    res.sendFile(`${__dirname}/frontend/build/index.html`, (error) => {
      if (error) {
        res.send('maintenance in progress, please check again in a minute');
      }
    });
  });

  const server = app.listen(parseInt(process.env.PORT ?? '8080', 10), () => {
    console.log('listening', {
      port: (server.address() as AddressInfo).port
    });
  });
})();
