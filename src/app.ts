import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
// import xssclean from 'xss-clean';
import dotenv from 'dotenv';
import mongoSanitize from 'express-mongo-sanitize';

const app = express();

dotenv.config();

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable Cors
app.use(cors());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//sanitize data
app.use(mongoSanitize());

//set security headers
app.use(helmet());

//Prevent XSS-CLEAN
// app.use(xssclean())


//errorHandler
import errorHandler from './middlewares/error';
app.use(errorHandler)


export default app;