const fs = require("fs");
const path = require('path');
const jwt = require('jsonwebtoken');
const file = path.join(__dirname, '..', 'data', 'Login.json');
const SECRET_KEY = "TonySama?1345?fsdfff4?2345?ZXasd?314?vcxh?ers!dfas#fa@fas%$fgdsa"; 


const Logs = (req, res, next) => {
  const logEntry = `${new Date()} | ${req.method} | ${req.url}\n`;

  fs.appendFile("data/Log.txt", logEntry, (error) => {
    if (error) {
      console.error("Error writing to Log.txt:", error);
    }
  });

  next();
};

const isAdmin = (req, res, next) => {
  const token = req.query.token ; 

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }

  fs.readFile(file, 'utf-8', (error, data) => {
    if (error) {
      console.error('Error reading file:', error);
      return res.status(404).json({ error: 'File not found', error });
    }

    try {
      const users = JSON.parse(data);

      const user = users.find(user => user.token === token && user.role === 'admin');

      if (user) {
        return next();
      } else {
        console.log('Access denied for token:', token);
        return res.status(403).json({ message: 'Access denied' });
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return res.status(404).json({ error: 'File not found', error });
    }
  });
};
const FindToken=(req, res, next)=> {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).send('Token is required');

  jwt.verify(token,SECRET_KEY, (err, user) => {
      if (err) return res.status(403).send('Invalid token');
      req.user = user;
      next();
  });
}

module.exports = { Logs, isAdmin,FindToken };
