import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://americanexpress-shoes-backend.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
