import { useState, useEffect } from 'react';
import AsaasAPI from './AsaasAPI';

const useCustomerCache = () => {
  // Customer names cache and loading state
  const [customerNames, setCustomerNames] = useState({});
  const [loadingCustomers, setLoadingCustomers] = useState({});

  // Cache configuration
  const CACHE_KEY = 'asaas_customer_names_cache';
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 1 day in milliseconds

  // Initialize cache from localStorage on hook mount
  useEffect(() => {
    const initializeCache = () => {
      try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data, timestamp: cacheTimestamp } = JSON.parse(cachedData);
          const now = Date.now();

          // Check if cache is still valid (within 1 day)
          if (now - cacheTimestamp < CACHE_DURATION) {
            setCustomerNames(data);
            console.log('Loaded customer names from cache:', Object.keys(data).length, 'entries');
          } else {
            // Cache expired, clear it
            localStorage.removeItem(CACHE_KEY);
            console.log('Customer names cache expired, cleared');
          }
        }
      } catch (error) {
        console.error('Error loading customer names cache:', error);
        localStorage.removeItem(CACHE_KEY);
      }
    };

    initializeCache();
  }, []);

  // Save customer names to localStorage whenever customerNames state changes
  useEffect(() => {
    if (Object.keys(customerNames).length > 0) {
      try {
        const cacheData = {
          data: customerNames,
          timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        console.log('Saved customer names to cache:', Object.keys(customerNames).length, 'entries');
      } catch (error) {
        console.error('Error saving customer names to cache:', error);
      }
    }
  }, [customerNames]);

  // Fetch customer data by ID
  const fetchCustomerName = async (customerId) => {
    if (!customerId || customerNames[customerId] || loadingCustomers[customerId]) {
      return;
    }

    setLoadingCustomers((prev) => ({ ...prev, [customerId]: true }));

    try {
      const customerData = await AsaasAPI.getCustomerById(customerId);
      const customerName = customerData.name || 'Nome não encontrado';

      setCustomerNames((prev) => ({
        ...prev,
        [customerId]: customerName,
      }));

      console.log(`Fetched customer name: ${customerId} -> ${customerName}`);
    } catch (err) {
      console.error(`Error fetching customer ${customerId}:`, err);
      const errorName = 'Erro ao carregar';
      setCustomerNames((prev) => ({
        ...prev,
        [customerId]: errorName,
      }));
    } finally {
      setLoadingCustomers((prev) => ({ ...prev, [customerId]: false }));
    }
  };

  // Clear customer names cache (useful for manual cache reset)
  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
    setCustomerNames({});
    console.log('Customer names cache cleared');
  };

  // Check if customer name is cached
  const isCustomerCached = (customerId) => !!customerNames[customerId];

  // Check if customer is currently loading
  const isCustomerLoading = (customerId) => !!loadingCustomers[customerId];

  // Get customer name from cache
  const getCustomerName = (customerId) => customerNames[customerId] || null;

  return {
    customerNames,
    loadingCustomers,
    fetchCustomerName,
    clearCache,
    isCustomerCached,
    isCustomerLoading,
    getCustomerName,
  };
};

export default useCustomerCache;
