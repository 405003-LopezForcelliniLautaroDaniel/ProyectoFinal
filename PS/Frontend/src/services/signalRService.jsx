import * as signalR from '@microsoft/signalr';
import {apiRoutes} from '../apiRoutes.ts';

let connection = null;
let messageHandlers = [];

const signalRService = {
  startConnection: async () => {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(apiRoutes.signalR.url)
      .withAutomaticReconnect()
      .build();

    try {
      await connection.start();
      console.log('Conexión a SignalR establecida');
    } catch (err) {
      console.error('Error al iniciar la conexión a SignalR: ', err);
    }
  },

  stopConnection: async () => {
    if (connection) {
      try {
        await connection.stop();
        console.log('Conexión a SignalR detenida');
      } catch (err) {
        console.error('Error al detener la conexión a SignalR: ', err);
      }
    }
  },

  onReceiveMessage: (callback) => {
    if (connection) {
      messageHandlers.push(callback);
      connection.on('ReceiveMessage', callback);
    }
  },

  offReceiveMessage: (callback) => {
    if (connection) {
      connection.off('ReceiveMessage', callback);
      messageHandlers = messageHandlers.filter(handler => handler !== callback);
    }
  },

  subscribeToClientMessages: (contact, callback) => {
    if (connection) {
      connection.on(`ReceiveMessage_${contact}`, (user) => {
        callback(user);
      });
    }
  },

  unsubscribeFromClientMessages: (contact) => {
    if (connection) {
      connection.off(`ReceiveMessage_${contact}`);
    }
  },
};

export default signalRService;