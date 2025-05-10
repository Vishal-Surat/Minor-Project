// backend/src/services/alienVaultService.js
import axios from 'axios';

const OTX_API_KEY = process.env.OTX_API_KEY;
const BASE_URL = 'https://otx.alienvault.com/api/v1/indicators';

const getIPThreatData = async (ip) => {
  try {
    const response = await axios.get(`${BASE_URL}/IPv4/${ip}/general`, {
      headers: {
        'X-OTX-API-KEY': OTX_API_KEY,
      },
    });

    return response.data;
  } catch (error) {
    console.error(`AlienVault API error for IP ${ip}:`, error?.response?.data || error.message);
    throw new Error('Failed to fetch threat data from AlienVault');
  }
};

export default getIPThreatData;
