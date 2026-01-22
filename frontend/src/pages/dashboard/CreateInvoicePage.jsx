import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInvoice } from '../../services/invoiceService';
import { getAllClients } from '../../services/clientService';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

const CreateInvoicePage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    
    // Initial state matching backend invoiceCreateSchema
    const [formData, setFormData] = useState({
        clientId: '',
        invoiceNumber: '',
        dueDate: '',
        items: [{ description: '', quantity: 1, rate: 0 }],
        discount: 0,
        taxRate: 18,
        paymentTerms: 'Net 30',
        notes: ''
    });

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const res = await getAllClients();
                if (res.success) {
                    setClients(res.data);
                } else {
                    showToast('Failed to load clients', 'error');
                }
            } catch (err) {
                console.error("Failed to fetch clients", err);
                showToast('Failed to load clients', 'error');
            }
        };
        fetchClients();
    }, [showToast]);

    const calculateSubtotal = () => {
        return formData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const tax = (subtotal * formData.taxRate) / 100;
        return subtotal + tax - formData.discount;
    };

    const handleAddItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { description: '', quantity: 1, rate: 0 }]
        });
    };

    const handleRemoveItem = (index) => {
        if (formData.items.length === 1) {
            showToast('At least one item is required', 'warning');
            return;
        }
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = field === 'description' ? value : Number(value) || 0;
        setFormData({ ...formData, items: newItems });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.clientId) newErrors.clientId = 'Please select a client';
        if (!formData.invoiceNumber) newErrors.invoiceNumber = 'Invoice number is required';
        if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
        
        const hasEmptyItems = formData.items.some(item => !item.description || item.quantity <= 0 || item.rate < 0);
        if (hasEmptyItems) {
            newErrors.items = 'All items must have description, quantity > 0, and rate >= 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            showToast('Please fix the errors in the form', 'error');
            return;
        }

        setLoading(true);
        try {
            const res = await createInvoice(formData);
            if (res.success) {
                showToast('Invoice created successfully!', 'success');
                navigate('/invoices');
            } else {
                showToast(res.message || 'Failed to create invoice', 'error');
            }
        } catch (error) {
            console.error('Submit error:', error);
            showToast(error.message || 'Error creating invoice', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <button 
                onClick={() => navigate('/invoices')} 
                className="flex items-center gap-2 text-gray-600 mb-6 hover:text-blue-600 transition"
            >
                <ArrowLeft size={20} /> Back to Invoices
            </button>

            <form onSubmit={handleSubmit} className="max-w-4xl bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Create New Invoice</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Client <span className="text-red-500">*</span>
                        </label>
                        <select 
                            required
                            className={`w-full border rounded-lg p-2 ${errors.clientId ? 'border-red-500' : 'border-gray-300'}`}
                            value={formData.clientId}
                            onChange={(e) => {
                                setFormData({...formData, clientId: e.target.value});
                                setErrors({...errors, clientId: null});
                            }}
                        >
                            <option value="">Choose a client...</option>
                            {clients.map(c => (
                                <option key={c._id} value={c._id}>
                                    {c.firstName} {c.lastName} {c.companyName ? `- ${c.companyName}` : ''}
                                </option>
                            ))}
                        </select>
                        {errors.clientId && <p className="text-red-500 text-xs mt-1">{errors.clientId}</p>}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Invoice Number <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="text" 
                            required 
                            placeholder="e.g. INV-2024-001"
                            className={`w-full border rounded-lg p-2 ${errors.invoiceNumber ? 'border-red-500' : 'border-gray-300'}`}
                            value={formData.invoiceNumber}
                            onChange={(e) => {
                                setFormData({...formData, invoiceNumber: e.target.value});
                                setErrors({...errors, invoiceNumber: null});
                            }}
                        />
                        {errors.invoiceNumber && <p className="text-red-500 text-xs mt-1">{errors.invoiceNumber}</p>}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Due Date <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="date" 
                            required
                            className={`w-full border rounded-lg p-2 ${errors.dueDate ? 'border-red-500' : 'border-gray-300'}`}
                            value={formData.dueDate}
                            onChange={(e) => {
                                setFormData({...formData, dueDate: e.target.value});
                                setErrors({...errors, dueDate: null});
                            }}
                        />
                        {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                        <select 
                            className="w-full border border-gray-300 rounded-lg p-2"
                            value={formData.paymentTerms}
                            onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}
                        >
                            <option value="Net 15">Net 15</option>
                            <option value="Net 30">Net 30</option>
                            <option value="Net 60">Net 60</option>
                            <option value="Due on Receipt">Due on Receipt</option>
                        </select>
                    </div>
                </div>

                {/* Items Section */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-800">
                            Invoice Items <span className="text-red-500">*</span>
                        </h3>
                        <button 
                            type="button" 
                            onClick={handleAddItem} 
                            className="text-blue-600 flex items-center gap-1 text-sm font-medium hover:text-blue-700"
                        >
                            <Plus size={16} /> Add Item
                        </button>
                    </div>
                    
                    {errors.items && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">
                            {errors.items}
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        {formData.items.map((item, index) => (
                            <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg">
                                <div className="flex-1">
                                    <input 
                                        type="text" 
                                        placeholder="Description *" 
                                        required
                                        className="w-full border border-gray-300 rounded-lg p-2"
                                        value={item.description}
                                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                    />
                                </div>
                                <div className="w-24">
                                    <input 
                                        type="number" 
                                        placeholder="Qty" 
                                        min="1" 
                                        required
                                        className="w-full border border-gray-300 rounded-lg p-2"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                    />
                                </div>
                                <div className="w-32">
                                    <input 
                                        type="number" 
                                        placeholder="Rate" 
                                        min="0" 
                                        required
                                        className="w-full border border-gray-300 rounded-lg p-2"
                                        value={item.rate}
                                        onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                                    />
                                </div>
                                <div className="w-32 text-right pt-2">
                                    <span className="font-medium">₹{(item.quantity * item.rate).toFixed(2)}</span>
                                </div>
                                {formData.items.length > 1 && (
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveItem(index)} 
                                        className="text-red-500 p-2 hover:bg-red-50 rounded transition"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary & Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-t pt-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea 
                            className="w-full border border-gray-300 rounded-lg p-2" 
                            rows="4"
                            placeholder="Any additional terms or conditions..."
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        ></textarea>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Tax Rate (%)</span>
                            <input 
                                type="number" 
                                className="w-20 border border-gray-300 rounded p-1 text-right"
                                value={formData.taxRate}
                                onChange={(e) => setFormData({...formData, taxRate: Number(e.target.value) || 0})}
                            />
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Discount (₹)</span>
                            <input 
                                type="number" 
                                className="w-20 border border-gray-300 rounded p-1 text-right"
                                value={formData.discount}
                                onChange={(e) => setFormData({...formData, discount: Number(e.target.value) || 0})}
                            />
                        </div>
                        
                        <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                            <span className="text-lg font-bold">Total</span>
                            <span className="text-lg font-bold text-blue-600">₹{calculateTotal().toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>Creating...</>
                    ) : (
                        <><Save size={20} /> Create Invoice</>
                    )}
                </button>
            </form>
        </div>
    );
};

export default CreateInvoicePage;