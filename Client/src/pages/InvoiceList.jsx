import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Plus, Search, Database, Loader2, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function InvoiceList() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState('');
  
  // Create invoice modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    invoiceNumber: '',
    customerName: '',
    customerEmail: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    lineItems: [{ description: '', quantity: 1, unitPrice: '' }]
  });

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/invoices', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      console.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/seed', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage(`✅ Created: ${data.invoiceNumber}`);
        await fetchInvoices();
      } else {
        setMessage('❌ Failed to seed');
      }
    } catch (err) {
      setMessage('❌ Error: Server not running');
    } finally {
      setSeeding(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Add new line item field
  const addLineItem = () => {
    setNewInvoice(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: '', quantity: 1, unitPrice: '' }]
    }));
  };

  // Remove line item
  const removeLineItem = (index) => {
    setNewInvoice(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index)
    }));
  };

  // Update line item
  const updateLineItem = (index, field, value) => {
    setNewInvoice(prev => {
      const items = [...prev.lineItems];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, lineItems: items };
    });
  };

  // Calculate totals
  const calculateTotal = () => {
    return newInvoice.lineItems.reduce((sum, item) => {
      return sum + (Number(item.quantity) * Number(item.unitPrice) || 0);
    }, 0);
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setCreating(true);
    
    try {
      if (!newInvoice.invoiceNumber || !newInvoice.customerName || !newInvoice.dueDate) {
        alert('Please fill in all required fields');
        setCreating(false);
        return;
      }

      if (newInvoice.lineItems.some(item => !item.description || !item.unitPrice)) {
        alert('Please fill in all line items');
        setCreating(false);
        return;
      }

      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/invoices', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newInvoice)
      });

      if (res.ok) {
        const data = await res.json();
        setShowCreateModal(false);
        setNewInvoice({
          invoiceNumber: '',
          customerName: '',
          customerEmail: '',
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: '',
          lineItems: [{ description: '', quantity: 1, unitPrice: '' }]
        });
        await fetchInvoices();
        setMessage(`✅ Created: ${data.invoiceNumber}`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create invoice');
      }
    } catch (err) {
      alert('Error: Server not running');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-[#4F46E5]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
              <p className="text-gray-500 mt-1">
                {user?.name ? `Welcome, ${user.name}` : 'Manage your invoices and payments'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* SEED BUTTON */}
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
              >
                {seeding ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Database size={20} />
                )}
                {seeding ? 'Seeding...' : 'Seed Data'}
              </button>

              {/* CREATE INVOICE BUTTON */}
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg transition-colors"
              >
                <Plus size={20} />
                <span>Create Invoice</span>
              </button>

              {/* LOGOUT BUTTON */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`mt-4 p-3 rounded-lg ${
              message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}

          {/* Search */}
          <div className="mt-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search invoices..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {invoices.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No invoices yet</h3>
            <p className="text-gray-500 mb-4">Click "Seed Data" or "Create Invoice" to get started</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleSeed}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Seed Sample Data
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors"
              >
                Create New Invoice
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {invoices.map((invoice) => (
              <Link
                key={invoice.id}
                to={`/invoices/${invoice.id}`}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#4F46E5]/10 rounded-xl flex items-center justify-center group-hover:bg-[#4F46E5] transition-colors">
                      <FileText size={24} className="text-[#4F46E5] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{invoice.invoiceNumber}</h3>
                      <p className="text-sm text-gray-500">{invoice.customerName}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(Number(invoice.total))}</p>
                    <p className="text-sm text-gray-500">Due {formatDate(invoice.dueDate)}</p>
                  </div>

                  <div className="ml-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      invoice.status === 'PAID' ? 'bg-green-100 text-green-700' :
                      new Date(invoice.dueDate) < new Date() ? 'bg-red-100 text-red-700' : 
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {invoice.status === 'PAID' ? 'Paid' : new Date(invoice.dueDate) < new Date() ? 'Overdue' : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${invoice.status === 'PAID' ? 'bg-green-500' : 'bg-[#4F46E5]'}`}
                      style={{ width: `${Math.min(100, (Number(invoice.amountPaid) / Number(invoice.total)) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-gray-500">
                    <span>Paid: {formatCurrency(Number(invoice.amountPaid))}</span>
                    <span>Balance: {formatCurrency(Number(invoice.balanceDue))}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CREATE INVOICE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">Create New Invoice</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleCreateInvoice} className="p-6 space-y-6">
              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Number *
                  </label>
                  <input
                    type="text"
                    value={newInvoice.invoiceNumber}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4F46E5] outline-none"
                    placeholder="INV-2024-001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={newInvoice.customerName}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, customerName: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4F46E5] outline-none"
                    placeholder="Acme Corporation"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Email
                </label>
                <input
                  type="email"
                  value={newInvoice.customerEmail}
                  onChange={(e) => setNewInvoice(prev => ({ ...prev, customerEmail: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4F46E5] outline-none"
                  placeholder="customer@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={newInvoice.issueDate}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, issueDate: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4F46E5] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={newInvoice.dueDate}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4F46E5] outline-none"
                    required
                  />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">Line Items</label>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="text-sm text-[#4F46E5] hover:text-[#4338CA] font-medium"
                  >
                    + Add Item
                  </button>
                </div>
                
                <div className="space-y-3">
                  {newInvoice.lineItems.map((item, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4F46E5] outline-none"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                        className="w-20 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4F46E5] outline-none"
                        min="1"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(index, 'unitPrice', e.target.value)}
                        className="w-28 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4F46E5] outline-none"
                        step="0.01"
                        min="0"
                        required
                      />
                      {newInvoice.lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-3 bg-[#4F46E5] text-white rounded-xl font-medium hover:bg-[#4338CA] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Creating...
                    </>
                  ) : (
                    'Create Invoice'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}