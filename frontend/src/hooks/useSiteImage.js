import { useState, useEffect } from 'react';
import axios from 'axios';

export const useSiteImage = (slot, defaultUrl) => {
  const [imageUrl, setImageUrl] = useState(defaultUrl);
  const [loading, setLoading] = useState(true);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/site-images/${slot}`);
        if (data && data.url) {
          setImageUrl(data.url);
        }
      } catch (error) {
        // Use default if no custom image exists
        console.log(`Using default image for slot: ${slot}`);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [slot, backendUrl]);

  return { imageUrl, loading };
};

export default useSiteImage;
