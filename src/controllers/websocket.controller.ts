import {Socket} from 'socket.io';
import {ws} from '../decorators/websocket.decorator';

/**
 * A demo controller for websocket
 */
@ws('/chats')
export class WebSocketController {
  constructor(
    @ws.socket() // Equivalent to `@inject('ws.socket')`
    private socket: Socket,
  ) {}

  /**
   * The method is invoked when a client connects to the server
   * @param socket
   */
  @ws.connect()
  connect(socket: Socket) {
    console.log('Client connected: %s', socket.id);
  }

  /**
   * Register a handler for 'chat message' events
   * @param msg
   */

  /**
   * Register a handler for all events
   * @param msg
   */
  @ws.subscribe(/.+/)
  logMessage(args: {topic: any, body: any;}[]) {
    const {topic, body} = args[0]
    this.socket.nsp.emit(topic, body);
  }

  /**
   * The method is invoked when a client disconnects from the server
   * @param socket
   */
  @ws.disconnect()
  disconnect() {
    console.log('Client disconnected: %s', this.socket.id);
  }
}
