import axios from "axios";
import { useEffect, useState } from "react";

// Get Mehod of any data from database
const useFetch = (url) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetching Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(url);
        setData(response.data);
        setLoading(false);
        /* if (response.data.length > 0) {
          setLoading(false);
        } */
      } catch (error) {
        setError(error);
      }
    };
    fetchData();
  }, [url]);

  const reFetch = async () => {
    setLoading(true);
    try {
      const response = await axios.get(url);
      setData(response.data);
    } catch (error) {
      setError(error);
    }
    setLoading(false);
  };
  return { loading, error, data, reFetch };
};

export default useFetch;
