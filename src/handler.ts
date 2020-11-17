import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { proxy, createServer } from 'aws-serverless-express';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { eventContext } from 'aws-serverless-express/middleware';
import { Context, APIGatewayProxyEvent } from 'aws-lambda';
import { Server } from 'http';

let server: Server = null;

async function bootstrapServer(){
  if (server === null) {
    const expressApp = express();

    const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
    nestApp.use(eventContext());
    await nestApp.init();

    server = createServer(expressApp);
  }
  return server;
}

export async function handler(event: APIGatewayProxyEvent, context: Context) {
  server = await bootstrapServer();
  return proxy(server, event, context, 'PROMISE').promise;
}
