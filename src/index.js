import http from "http";
import express from "express";
import cors from "cors";
import bodyParser from 'body-parser';
import multer from 'multer';
import { s3Config, s3Region,s3Bucket } from './config'

// Amazon S3 Setup
import AWS from 'aws-sdk';
import multerS3 from 'multer-s3';

AWS.config.update(s3Config);

AWS.config.region = s3Region ;

const s3 = new AWS.S3();

const PORT = 3000;
var app = express();
app.server = http.createServer(app);

app.use(cors({
    exposedHeaders: "*"
}));

app.use(bodyParser.json({
    limit: '50mb'
}));
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: s3Bucket,
        metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
        },
        key: function (req, file, cb) {
            const filename = `${Date.now().toString()}-${file.originalname}`;
            cb(null, filename)
        },
        acl: 'public-read',
    })
})
app.upload = upload;

app.s3 = s3;

app.server.listen(process.env.PORT || PORT, () => {
    console.log(`App is running on port ${app.server.address().port}`);
});

app.post('/upload', upload.array('files'), function(req, res, next) {
    res.json(req.files)
  })

export default app;