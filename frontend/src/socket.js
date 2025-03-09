import { io } from 'socket.io-client';
import { ip } from './ContentExport';

const token = localStorage.getItem('token'); // Adjust based on your auth strategy
const socket = io(`${ip.address}`, {
    withCredentials: true, // Enables cookie-based authentication
  });
  

export default socket;
