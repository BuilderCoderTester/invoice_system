import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import PaymentModal from '../components/PaymentModal';
import TaxCalculator from '../components/TaxCalculator';
import CurrencyConverter from '../components/CurrencyConverter';
import { 
  FileText, Calendar, User, DollarSign, CreditCard, Archive, 
  RotateCcw, CheckCircle2, Clock, AlertCircle, ArrowLeft, 
  Download, Printer, MoreVertical, Building2, Mail, Phone, 
  MapPin, Loader2, LogOut, Receipt, Globe, Calculator,
  Bell, TrendingUp
} from 'lucide-react';

export default function InvoiceDetails() {
  const { id } = useParams();
  const { logout } = useAuth();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY'];

  const fetchInvoice = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/invoices/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setInvoice(data);
    } catch (err) {
      setError('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handleAddPayment = async (amount) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/invoices/${id}/payments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error);
      }
      
      await fetchInvoice();
      setShowPaymentModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleArchive = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/invoices/${id}/archive`, { 
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchInvoice();
    } catch (err) {
      alert('Failed to archive invoice');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/invoices/${id}/restore`, { 
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchInvoice();
    } catch (err) {
      alert('Failed to restore invoice');
    } finally {
      setActionLoading(false);
    }
  };

  const downloadPDF = async () => {
    setPdfLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/invoices/${id}/pdf`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to generate PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to download PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  const sendReminder = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/invoices/${id}/remind`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('Reminder sent successfully!');
    } catch (err) {
      alert('Failed to send reminder');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-[#4F46E5]" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center">
        <div className="text-red-500 flex items-center gap-2">
          <AlertCircle size={24} />
          {error || 'Invoice not found'}
        </div>
      </div>
    );
  }

  const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.status !== 'PAID';
  const daysOverdue = isOverdue ? Math.floor((new Date() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24)) : 0;
  const progressPercent = Math.min(100, (Number(invoice.amountPaid) / Number(invoice.total)) * 100);

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-gray-100 rounded-lg transition-all hover:scale-110">
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Invoice Details</h1>
              <p className="text-sm text-gray-500">{invoice.invoiceNumber}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Currency Selector */}
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4F46E5] outline-none"
            >
              {currencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <button 
              onClick={() => setShowCurrencyModal(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all hover:rotate-12"
              title="Currency Converter"
            >
              <Globe size={20} />
            </button>

            <button 
              onClick={() => setShowTaxModal(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all hover:rotate-12"
              title="Tax Calculator"
            >
              <Calculator size={20} />
            </button>

            <button 
              onClick={downloadPDF}
              disabled={pdfLoading}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all hover:scale-105 disabled:opacity-50"
            >
              {pdfLoading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
              <span className="hidden sm:inline">PDF</span>
            </button>

            {isOverdue && (
              <button 
                onClick={sendReminder}
                className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg transition-all hover:scale-105 animate-pulse"
              >
                <Bell size={18} />
                <span className="hidden sm:inline">Remind</span>
              </button>
            )}

            <button 
              onClick={logout}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all hover:rotate-90"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Overdue Alert */}
        {isOverdue && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-4 animate-shake">
            <AlertCircle className="text-red-600" size={24} />
            <div className="flex-1">
              <p className="font-semibold text-red-800">Overdue by {daysOverdue} days</p>
              <p className="text-sm text-red-600">This invoice is past due. Consider sending a reminder.</p>
            </div>
            <button 
              onClick={sendReminder}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Send Reminder
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Status Card with Animation */}
            <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-500 ${animationsEnabled ? 'hover:shadow-lg hover:scale-[1.02]' : ''}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 ${animationsEnabled ? 'hover:scale-110' : ''} ${
                    invoice.status === 'PAID' ? 'bg-green-100' : 
                    isOverdue ? 'bg-red-100' : 'bg-amber-100'
                  }`}>
                    {invoice.status === 'PAID' ? (
                      <CheckCircle2 size={28} className="text-green-600 animate-bounce" />
                    ) : isOverdue ? (
                      <AlertCircle size={28} className="text-red-600 animate-pulse" />
                    ) : (
                      <Clock size={28} className="text-amber-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold transition-all ${animationsEnabled ? 'hover:scale-105' : ''} ${
                      invoice.status === 'PAID' ? 'bg-green-100 text-green-700' :
                      isOverdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {invoice.status === 'PAID' ? 'Paid' : isOverdue ? 'Overdue' : 'Pending'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">Balance Due ({selectedCurrency})</p>
                  <p className={`text-2xl font-bold transition-all ${Number(invoice.balanceDue) === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {formatCurrency(Number(invoice.balanceDue) * (selectedCurrency === 'USD' ? 1 : 0.85))}
                  </p>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Progress</span>
                  <span className="font-medium text-gray-900">{progressPercent.toFixed(0)}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${animationsEnabled ? 'animate-pulse' : ''} ${
                      invoice.status === 'PAID' ? 'bg-green-500' : isOverdue ? 'bg-red-500' : 'bg-[#4F46E5]'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Paid: {formatCurrency(Number(invoice.amountPaid))}</span>
                  <span>Total: {formatCurrency(Number(invoice.total))}</span>
                </div>
              </div>
            </div>

            {/* Invoice Info */}
            <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-300 ${animationsEnabled ? 'hover:shadow-md' : ''}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">From</p>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      <Building2 size={16} />
                      Your Company Name
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Mail size={14} />
                      billing@company.com
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Phone size={14} />
                      +1 (555) 123-4567
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Bill To</p>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      <User size={16} />
                      {invoice.customerName}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Mail size={14} />
                      customer@example.com
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <MapPin size={14} />
                      123 Business St, City
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Invoice Date</p>
                  <p className="font-medium text-gray-900">{formatDate(invoice.issueDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Due Date</p>
                  <p className={`font-medium ${isOverdue ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>
                    {formatDate(invoice.dueDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Invoice Number</p>
                  <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                </div>
              </div>
            </div>

            {/* Line Items with Hover Effects */}
            <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${animationsEnabled ? 'hover:shadow-md' : ''}`}>
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Line Items</h2>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoice.lineItems.map((item, index) => (
                    <tr 
                      key={item.id} 
                      className={`transition-colors duration-200 ${animationsEnabled ? 'hover:bg-blue-50 hover:scale-[1.01]' : 'hover:bg-gray-50'}`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{item.description}</p>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600">{item.quantity}</td>
                      <td className="px-6 py-4 text-right text-gray-600">{formatCurrency(Number(item.unitPrice))}</td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">{formatCurrency(Number(item.lineTotal))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(Number(invoice.total))}</span>
                </div>
              </div>
            </div>

            {/* Payment History */}
            <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${animationsEnabled ? 'hover:shadow-md' : ''}`}>
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Payment History</h2>
                <CreditCard size={20} className="text-gray-400" />
              </div>
              {invoice.payments.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No payments recorded yet
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {invoice.payments.map((payment, index) => (
                    <div 
                      key={payment.id} 
                      className={`px-6 py-4 flex items-center justify-between transition-all duration-300 ${animationsEnabled ? 'hover:bg-green-50 hover:pl-8' : 'hover:bg-gray-50'}`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-green-100 flex items-center justify-center ${animationsEnabled ? 'animate-bounce' : ''}`}>
                          <CheckCircle2 size={20} className="text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Payment Received</p>
                          <p className="text-sm text-gray-500">{formatDate(payment.paymentDate)}</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(Number(payment.amount))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Actions Card */}
            <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-300 ${animationsEnabled ? 'hover:shadow-lg' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Actions</h3>
                <button
                  onClick={() => setAnimationsEnabled(!animationsEnabled)}
                  className="text-xs text-gray-500 hover:text-[#4F46E5]"
                >
                  {animationsEnabled ? 'Disable' : 'Enable'} Animations
                </button>
              </div>
              
              {invoice.status !== 'PAID' && !invoice.isArchived && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={actionLoading}
                  className={`w-full py-3 bg-[#4F46E5] hover:bg-[#4338CA] disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 mb-3 ${animationsEnabled ? 'hover:scale-[1.02] active:scale-95' : ''}`}
                >
                  <DollarSign size={20} />
                  Record Payment
                </button>
              )}

              {!invoice.isArchived ? (
                <button
                  onClick={handleArchive}
                  disabled={actionLoading}
                  className={`w-full py-3 border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${animationsEnabled ? 'hover:scale-[1.02]' : ''}`}
                >
                  {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <Archive size={18} />}
                  {actionLoading ? 'Processing...' : 'Archive Invoice'}
                </button>
              ) : (
                <button
                  onClick={handleRestore}
                  disabled={actionLoading}
                  className={`w-full py-3 border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${animationsEnabled ? 'hover:scale-[1.02]' : ''}`}
                >
                  {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <RotateCcw size={18} />}
                  {actionLoading ? 'Processing...' : 'Restore Invoice'}
                </button>
              )}
            </div>

            {/* Tax Summary */}
            <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${animationsEnabled ? 'hover:shadow-md transition-all' : ''}`}>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Receipt size={18} />
                Tax Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatCurrency(Number(invoice.total))}</span>
                </div>
                <div className="flex justify-between text-amber-600">
                  <span>Tax (8%)</span>
                  <span>{formatCurrency(Number(invoice.total) * 0.08)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total with Tax</span>
                  <span>{formatCurrency(Number(invoice.total) * 1.08)}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-2xl p-6 text-white">
              <h3 className="text-sm font-medium text-white/70 mb-4 flex items-center gap-2">
                <TrendingUp size={16} />
                Invoice Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className={`${animationsEnabled ? 'animate-pulse' : ''}`}>
                  <p className="text-2xl font-bold">{invoice.lineItems.length}</p>
                  <p className="text-xs text-white/70">Line Items</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{invoice.payments.length}</p>
                  <p className="text-xs text-white/70">Payments</p>
                </div>
              </div>
            </div>

            {/* Status Info */}
            {invoice.isArchived && (
              <div className="bg-gray-100 rounded-2xl p-4 flex items-center gap-3 animate-fade-in">
                <Archive size={20} className="text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">Archived</p>
                  <p className="text-sm text-gray-500">This invoice is archived</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPaymentModal && (
        <PaymentModal
          balanceDue={Number(invoice.balanceDue)}
          onClose={() => setShowPaymentModal(false)}
          onSubmit={handleAddPayment}
        />
      )}

      {showTaxModal && (
        <TaxCalculator 
          amount={Number(invoice.total)}
          onClose={() => setShowTaxModal(false)}
        />
      )}

      {showCurrencyModal && (
        <CurrencyConverter
          amount={Number(invoice.total)}
          onClose={() => setShowCurrencyModal(false)}
        />
      )}
    </div>
  );
}