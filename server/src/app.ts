import express from 'express';
import ExpressWS, {Application} from 'express-ws';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import WSRoute from './routes/ws';
import Info from "./routes/info";

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(cors());
ExpressWS(app);
WSRoute(app as unknown as Application);
Info(app);

app.use('/img', express.static(process.cwd() + '/public/img'));
app.use(express.static(process.cwd() + '/public/build'));

// @ts-ignore
app.use(function(err, req, res, next) {
    console.log(err);
});



app.listen(process.env.PORT, async () => {
    console.log(`Server run on ${process.env.PORT} port`);
});

