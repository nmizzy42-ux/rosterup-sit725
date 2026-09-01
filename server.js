// Import the Express module so we can create a web server. 
const express = require('express'); 
const path = require('path'); 
const mongoose = require('mongoose');
require('dotenv').config();
const app = express(); 
const port = process.env.PORT || 3000; 

// Open Question - AWS or GCP to host?
mongoose.connect(process.env.MONGO_URI);
mongoose.connection.on('connected', () => { console.log('Connected to MongoDB!'); });

// Import Routes
const shiftRoutes = require('./routes/shifts.routes');
const userRoutes = require('./routes/users.routes');
const workplaceRoutes = require('./routes/workplaces.routes');
const authRoutes = require('./routes/auth.routes');

app.use(express.static(path.join(__dirname, 'public'))); 

app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workplaces', workplaceRoutes);
app.use('/api/shifts', shiftRoutes);

app.listen(port, () => { 
    console.log(`Server is running on http://localhost:${port}`); 
});