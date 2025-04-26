'use client';

import { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  const [cacheType, setCacheType] = useState<'lru' | 'lru-ttl'>('lru');
  const [capacity, setCapacity] = useState<number>(5);
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [ttlInSeconds, setTtlInSeconds] = useState<number>(60);
  const [cache, setCache] = useState<{ key: string, value: string }[]>([]);
  const [result, setResult] = useState<string>('');

  const apiUrl = cacheType === 'lru' ? 'http://localhost:9090/api/lru' : 'http://localhost:9090/api/lru-ttl';

  const handleSetCapacity = async () => {
    try {
      const res = await fetch(`${apiUrl}/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capacity }),
      });
      if (res.ok) {
        toast.success('Cache initialized!');
        setCache([]);
        setResult('');
      } else {
        throw new Error('Failed to initialize cache');
      }
    } catch (error) {
      toast.error('Error initializing cache');
    }
  };

  const handlePut = async () => {
    if (!key || !value) {
      toast.warn('Key and Value are required!');
      return;
    }
    try {
      const body = cacheType === 'lru-ttl'
        ? { key, value, ttlInSeconds }
        : { key, value };

      const res = await fetch(`${apiUrl}/put`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success('Inserted into cache!');
        setKey('');
        setValue('');
        fetchCache();
      } else {
        throw new Error('Failed to insert');
      }
    } catch (error) {
      toast.error('Error inserting into cache');
    }
  };

  const handleGet = async () => {
    if (!key) {
      toast.warn('Key is required!');
      return;
    }
    try {
      const res = await fetch(`${apiUrl}/get/${key}`);
      const data = await res.json();

      if (res.ok && data.value) {
        setResult(data.value);
        toast.success(`Found value: ${data.value}`);
      } else {
        setResult('Key not found');
        toast.error(data.error || 'Key not found');
      }
    } catch (error) {
      setResult('Key not found');
      toast.error('Error fetching key');
    }
  };

  const fetchCache = async () => {
    try {
      const res = await fetch(`${apiUrl}/cache`);
      const data = await res.json();
      setCache(data.cache);
    } catch (error) {
      toast.error('Error fetching cache');
    }
  };

  useEffect(() => {
    fetchCache();
    setResult('');
  }, [cacheType]);

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-2xl text-black space-y-6">
        <h1 className="text-4xl font-bold text-center">🚀 LRU Cache Playground</h1>

        {/* Cache Type Switch */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setCacheType('lru')}
            className={`px-4 py-2 rounded-lg ${cacheType === 'lru' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          >
            LRU
          </button>
          <button
            onClick={() => setCacheType('lru-ttl')}
            className={`px-4 py-2 rounded-lg ${cacheType === 'lru-ttl' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          >
            LRU + TTL
          </button>
        </div>

        {/* Set Capacity */}
        <div className="space-y-4">
          <input
            type="number"
            placeholder="Cache Capacity"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="w-full p-2 rounded-lg border-2 border-gray-300"
          />
          <button onClick={handleSetCapacity} className="w-full bg-green-500 text-white py-2 rounded-lg">
            Set Capacity
          </button>
        </div>

        {/* Add Key-Value */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full p-2 rounded-lg border-2 border-gray-300"
          />
          <input
            type="text"
            placeholder="Value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full p-2 rounded-lg border-2 border-gray-300"
          />
          {cacheType === 'lru-ttl' && (
            <input
              type="number"
              placeholder="TTL (seconds)"
              value={ttlInSeconds}
              onChange={(e) => setTtlInSeconds(Number(e.target.value))}
              className="w-full p-2 rounded-lg border-2 border-gray-300"
            />
          )}
          <div className="flex gap-4">
            <button onClick={handlePut} className="w-1/2 bg-blue-500 text-white py-2 rounded-lg">
              Add to Cache
            </button>
            <button onClick={handleGet} className="w-1/2 bg-yellow-500 text-white py-2 rounded-lg">
              Get Value
            </button>
          </div>
        </div>

        {/* Result Card */}
        {result !== '' && (
          <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center font-semibold">
            Result: {result}
          </div>
        )}

        {/* Cache Diagram */}
        <div className="flex items-center justify-center overflow-x-auto space-x-4 p-4 bg-gray-100 rounded-lg">
          <AnimatePresence>
            {Array.isArray(cache) && cache.map((item, index) => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="bg-purple-400 p-4 rounded-lg shadow-md min-w-[100px] text-center relative"
              >
                <div className="font-bold">{item.key}</div>
                <div className="text-sm">{item.value}</div>
                {index < cache.length - 1 && (
                  <div className="absolute right-[-20px] top-1/2 transform -translate-y-1/2 text-2xl">➡️</div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <ToastContainer position="top-center" />
    </div>
  );
}
