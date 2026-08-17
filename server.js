const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
app.use(helmet());
app.use(rateLimit({windowMs: 15*60*1000, max: 100}));
app.use(express.static(path.join(__dirname, 'src')));
app.get('/health', (req, res) => res.json({status: 'ok'}));
app.listen(3000, '0.0.0.0', () => console.log('Server running on port 3000'));
