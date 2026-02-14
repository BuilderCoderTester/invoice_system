import { useState } from 'react';
import { X, Calculator, Loader2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const countries = [
  { code: 'US', name: 'United States', rate: 8 },
  { code: 'UK', name: 'United Kingdom', rate: 20 },
  { code: 'EU', name: 'European Union', rate: 19 },
  { code: 'IN', name: 'India', rate: 18 },
  { code: 'JP', name: 'Japan', rate: 10 },
];

export default function TaxCalculator({ amount, onClose }) {
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const calculateTax = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/calculate-tax', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount, country: selectedCountry })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert('Failed to calculate tax');
    } finally {
      setLoading(false);
    }
  };

  const country = countries.find(c => c.code === selectedCountry);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calculator size={20} className="text-[#4F46E5]" />
            Tax Calculator
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Country</label>
            <select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setResult(null);
              }}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4F46E5] outline-none"
            >
              {countries.map(c => (
                <option key={c.code} value={c.code}>{c.name} ({c.rate}%)</option>
              ))}
            </select>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Subtotal</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(amount)}</p>
          </div>

          <button
            onClick={calculateTax}
            disabled={loading}
            className="w-full py-3 bg-[#4F46E5] text-white rounded-xl font-medium hover:bg-[#4338CA] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Calculate Tax'}
          </button>

          {result && (
            <div className="space-y-2 p-4 bg-blue-50 rounded-lg animate-fade-in">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax Rate</span>
                <span className="font-medium">{result.taxRate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax Amount</span>
                <span className="font-medium text-amber-600">{formatCurrency(result.taxAmount)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-lg text-[#4F46E5]">{formatCurrency(result.total)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}