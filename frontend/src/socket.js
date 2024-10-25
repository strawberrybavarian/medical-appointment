import { io } from 'socket.io-client';
import { ip } from './ContentExport';

const token = localStorage.getItem('token'); // Adjust based on your auth strategy
const socket = io(`${ip.address}`, {
  auth: {
    token: localStorage.getItem('token'), // Ensure token is stored in localStorage
  },
});

export default socket;
