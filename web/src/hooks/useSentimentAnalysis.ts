import { useState } from 'react';
import { api } from '@/lib/api'; // O nosso Axios

export interface SentimentResult {
  score: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export const useSentimentAnalysis = () => {
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeText = async (text: string): Promise<SentimentResult | null> => {
    if (!text || text.trim().length < 3) return null;

    setAnalyzing(true);
    try {
      // Chama a nossa nova API Node.js
      const response = await api.post('/ai/sentiment', { text });
      return response.data;
      
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return { score: 0, sentiment: 'neutral' }; // Fallback seguro
    } finally {
      setAnalyzing(false);
    }
  };

  return {
    analyzeText,
    analyzing
  };
};