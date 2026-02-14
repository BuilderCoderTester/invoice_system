import { useState } from 'react';
import { X, Globe, Loader2, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
];

export default function CurrencyConverter({ amount, onClose }) {
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const convert = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/convert-currency', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount, from, to })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert('Failed to convert currency');
    } finally {
      setLoading(false);
    }
  };

  const swapCurrencies = () => {
    setFrom(to);
    setTo(from);
    setResult(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Globe size={20} className="text-[#4F46E5]" />
            Currency Converter
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Amount</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(amount)}</p>
            <p className="text-sm text-gray-500">{currencies.find(c => c.code === from)?.name}</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={from}
              onChange={(e) => { setFrom(e.target.value); setResult(null); }}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4F46E5] outline-none"
            >
              {currencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
            </select>
            
            <button 
              onClick={swapCurrencies}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowRight size={20} className="text-gray-400" />
            </button>
            
            <select
              value={to}
              onChange={(e) => { setTo(e.target.value); setResult(null); }}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4F46E5] outline-none"
            >
              {currencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
            </select>
          </div>

          <button
            onClick={convert}
            disabled={loading}
            className="w-full py-3 bg-[#4F46E5] text-white rounded-xl font-medium hover:bg-[#4338CA] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Convert'}
          </button>

          {result && (
            <div className="p-4 bg-green-50 rounded-lg animate-fade-in">
              <p className="text-sm text-gray-600 mb-1">Converted Amount</p>
              <p className="text-3xl font-bold text-green-600">
                {currencies.find(c => c.code === to)?.symbol}
                {result.converted.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                1 {from} = {result.rate.toFixed(4)} {to}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}