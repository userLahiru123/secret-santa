require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

app.use(cors());
app.use(express.json());

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
});

connection.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to MySQL database.');
});

app.get('/api/check-first-attemp/:email', (req, res) => {
    const email = req.params.email;
    connection.query(`SELECT isFirstAttemp FROM staff WHERE email='${email}'`, (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Database query failed' });
        } else {
            if(results.length>1){
                res.json({message:"got results more than 1"});
            }
            res.json(results);
        }
    });

});

app.get('/api/select-member/:email', (req, res) => {
    const email = req.params.email;

    connection.query(`UPDATE staff SET isFirstAttemp=1 WHERE email='${email}'`);

    connection.query(`SELECT name FROM staff WHERE email!='${email}' AND isGifted=0`, (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Database query failed' });
        } else {

            const selectedMembers = [];
            results.forEach(row => {
                selectedMembers.push(row.name);
            })

            const randomIndex = Math.floor(Math.random() * selectedMembers.length);
            const randomMember = selectedMembers[randomIndex];

            connection.query(`UPDATE staff SET isGifted=1 WHERE name='${randomMember}'`, (error, results) => {
                if (error) {
                    res.status(500).json({ error: error });
                } else {
                    res.json({ name: randomMember });
                }
            });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
