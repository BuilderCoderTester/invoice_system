import { useState } from 'react';
import { X, DollarSign, Loader2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function PaymentModal({ balanceDue, onClose, onSubmit }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (numAmount > balanceDue) {
      setError(`Amount cannot exceed ${formatCurrency(balanceDue)}`);
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit(numAmount);
    } catch (err) {
      setError('Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Record Payment</h2>
          <button 
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                step="0.01"
                max={balanceDue}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent outline-none transition-all text-lg font-semibold disabled:bg-gray-100"
                placeholder="0.00"
                autoFocus
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Balance due: <span className="font-semibold text-gray-700">{formatCurrency(balanceDue)}</span>
            </p>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-[#4F46E5] text-white rounded-xl font-medium hover:bg-[#4338CA] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                'Confirm Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}