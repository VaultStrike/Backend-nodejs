const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "nicklos"; 
const LoginFile = "data/Login.json";
const { fsReadFile, fsWriteFile } = require("./products");

const CreateUser = async (req, res) => {
  const { name, password, Email } = req.body;

  if (!name || !password || !Email) {
      return res.status(400).json({
          error: 'Missing required fields: name, password, and Email are required.',
      });
  }

  try {
      let users = await fsReadFile(LoginFile);

      const existingUser = users.find((user) => user.Email === Email);

      if (existingUser) {
          return res.status(400).json({ error: 'Email already exists. Please use a different email.' });
      }

      const newUser = { id: uuidv4(), name, password, Email, role: "visitor" };
      const token = jwt.sign({ name, Email }, SECRET_KEY, { expiresIn: '14d' });
      newUser.token = token;
      users.push(newUser);

      await fsWriteFile(LoginFile, users);
      res.json({ token });
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};
const WelcomeUser=(req, res)=>{
  res.json({ message: `Welcome ${req.user.name}` });
}
const checkUsers = async (req, res) => {
  try {
    const users = await fsReadFile(LoginFile);
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: 'Error reading the file' });
  }
};

const CheckByToken = async (req, res) => {
  const { token } = req.params;

  console.log('Received token:', token); 
  jwt.verify(token, SECRET_KEY, async (err, decoded) => {
    if (err) {
      console.error('Token verification error:', err); 
      return res.status(401).json({ error: 'Invalid token' });
    }

    try {
      const users = await fsReadFile(LoginFile);
      console.log('Users from file:', users); 


      const matchingUsers = users.filter(user => user.token === token);
      console.log('Matching users:', matchingUsers); 

      if (matchingUsers.length > 0) {
        
        matchingUsers.map(user => {
          user.token = jwt.sign({ 
            name: user.name, 
            Email: user.Email, 
            id: uuidv4(), 
            password: user.password, 
            role: user.role 
          }, SECRET_KEY, { expiresIn: '14d' });
        });

        await fsWriteFile(LoginFile, users);
        res.json(matchingUsers);
      } else {
        res.status(404).json({ error: 'No users found with the provided token' });
      }
    } catch (error) {
      console.error('Internal server error:', error); 
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};


const DeleteUser = async (req, res) => {
  const { token } = req.params;

  try {
    const users = await fsReadFile(LoginFile);

    const filteredUsers = users.filter(user => user.token !== token);

    if (filteredUsers.length === users.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    await fsWriteFile(LoginFile, filteredUsers);

    res.json({ message: `User with token ${token} deleted` });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { CreateUser, CheckByToken, DeleteUser, checkUsers ,WelcomeUser};
