// backend/src/services/jsonPlaceholderService.js
import axios from 'axios';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

export const getSamplePosts = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/posts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sample posts:', error.message);
    throw new Error('Failed to fetch sample posts');
  }
};

export const getSampleUsers = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/users`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sample users:', error.message);
    throw new Error('Failed to fetch sample users');
  }
};
