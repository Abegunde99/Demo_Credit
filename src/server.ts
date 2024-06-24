import app from './app';
import dotenv from 'dotenv';
import knex from './database/db';
dotenv.config();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { 
    console.log(`Server is running on port ${PORT}`);
    knex.raw('SELECT 1+1 as result').then(() => {
        console.log('Database connection established');
    }).catch((err) => {
        console.log(err);
    });
});