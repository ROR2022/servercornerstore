import {
  S3Client,
  PutObjectCommand,
  PutBucketCorsCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
//import fs from 'fs';
//import { __dirname } from "../app.js";
//import { mainDir } from "../../";
//import { AppService } from 'src/app.service';
//import { ConfigService } from '@nestjs/config';

//de AppService se obtiene el valor de las variables de entorno
/* const appService = new AppService(new ConfigService());
const dataEnv = appService.getDataEnv();
const { AWS_ACCESSKEYID, AWS_BUCKETNAME, AWS_SECRETACCESSKEY, AWS_REGION } =
  dataEnv; */

type MyType = {
  msg: string;
  resultUpload?: any;
  error?: any;
};

//const mainDir = process.cwd();

export const generateUniqueId = () => {
  const length = 24;
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!$%&*()_+?';
  let result = '';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    result += characters[randomIndex];
  }
  return result;
};

/* export const setCorsBucket = async () => {
  const client = new S3Client({
    credentials: {
      accessKeyId: AWS_ACCESSKEYID,
      secretAccessKey: AWS_SECRETACCESSKEY,
    },
    region: AWS_REGION,
  });
  //console.log('AWS_ACCESSKEYID:',AWS_ACCESSKEYID);
  //console.log('AWS_SECRETACCESSKEY:',AWS_SECRETACCESSKEY);
  //console.log('AWS_BUCKETNAME:',AWS_BUCKETNAME);
  try {
    const input = {
      // PutBucketCorsRequest
      Bucket: AWS_BUCKETNAME, // required
      CORSConfiguration: {
        // CORSConfiguration
        CORSRules: [
          // CORSRules // required
          {
            // CORSRule
            AllowedHeaders: [
              // AllowedHeaders
              '*',
            ],
            AllowedMethods: [
              // AllowedMethods // required
              'POST',
              'GET',
            ],
            AllowedOrigins: [
              // AllowedOrigins // required
              '*',
            ],
            ExposeHeaders: [],
          },
        ],
      },
    };
    const command = new PutBucketCorsCommand(input);
    const response = await client.send(command);

    console.log('response setCorsBucket:..', response);
  } catch (error) {
    console.log('Error setBucketCors:..', error);
  }
}; */

export const uploadOneFileToBucket = async (
  dataFile: any,
  target_id: any,
  dataEnv: any,
) => {
  const { AWS_ACCESSKEYID, AWS_BUCKETNAME, AWS_SECRETACCESSKEY, AWS_REGION } =
    dataEnv;
  //console.log('dataEnv(uploadOneFileToBucket):...', dataEnv);
  const client = new S3Client({
    credentials: {
      accessKeyId: AWS_ACCESSKEYID || '',
      secretAccessKey: AWS_SECRETACCESSKEY || '',
    },
    region: AWS_REGION || '',
  });
  let response: MyType = {
    msg: 'Proceso upLoadOneFileToBucket:..',
  };

  try {
    //console.log('alparecer todo ok al leer el archivo:..', dataFile);

    const input: PutObjectCommandInput = {
      ACL: 'public-read',
      Body: dataFile.buffer,
      Bucket: AWS_BUCKETNAME || '',
      Key: `${target_id}/${dataFile.originalname}`,
    };
    const command = new PutObjectCommand(input);
    const resultUpload = await client.send(command);
    //const resultUploadFile = `resultUpload${item.name}`;
    //console.log('resultUpload_AWSLIB(uploadOneFileToBucket):...', resultUpload);

    response = {
      ...response,
      resultUpload,
    };
    return response;
  } catch (error) {
    return {
      ...response,
      error,
    };
  }
};
