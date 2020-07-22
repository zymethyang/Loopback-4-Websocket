import {ApplicationConfig} from '@loopback/core';
import {HttpServer} from '@loopback/http-server';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent
} from '@loopback/rest-explorer';
import express from 'express';
import path from 'path';
import {WebSocketController} from './controllers/websocket.controller';
import {MySequence} from './sequence';
import {WebSocketServer} from './websocket.server';

export {ApplicationConfig};

export class LoopbackWsApplication extends RestApplication {
  readonly httpServer: HttpServer;
  readonly wsServer: WebSocketServer;

  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    /*
    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
    */

    const expressApp = express();
    // Create an http server backed by the Express app
    this.httpServer = new HttpServer(expressApp, options.websocket);

    // Create ws server from the http server
    const wsServer = new WebSocketServer(this.httpServer);
    this.bind('servers.websocket.server1').to(wsServer);
    wsServer.use((socket, next) => {
      console.log('Global middleware - socket:', socket.id);
      next();
    });
    // Add a route
    const ns = wsServer.route(WebSocketController, /^\/chats\/\d+$/);
    ns.use((socket, next) => {
      console.log(
        'Middleware for namespace %s - socket: %s',
        socket.nsp.name,
        socket.id,
      );
      next();
    });
    this.wsServer = wsServer;
  }

  start() {
    return this.wsServer.start();
  }

  stop() {
    return this.wsServer.stop();
  }
}
