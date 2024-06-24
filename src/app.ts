import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
// import xssClean from 'xss-clean';
import hpp from 'hpp';
import dotenv from 'dotenv';
import router from './routes';

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

//set security headers
app.use(helmet());

//Prevent XSS-CLEAN
// app.use(xssClean())

//prevent params pollution
app.use(hpp())

//Routes
app.use('/api/v1', router);

//errorHandler
import ErrorMiddleware from "./middlewares/error2";
app.use(ErrorMiddleware.notFound);



export default app;