import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInvoice } from '../../services/invoiceService';
import { getAllClients } from '../../services/clientService';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';

const CreateInvoicePage = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Initial state matching invoiceCreateSchema
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
                if (res.success) setClients(res.data);
            } catch (err) {
                console.error("Failed to fetch clients", err);
            }
        };
        fetchClients();
    }, []);

    const handleAddItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { description: '', quantity: 1, rate: 0 }]
        });
    };

    const handleRemoveItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = field === 'description' ? value : Number(value);
        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await createInvoice(formData); //
            if (res.success) {
                alert("Invoice created successfully!");
                navigate('/dashboard/invoices');
            }
        } catch (error) {
            alert(error.message || "Error creating invoice");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ml-64 p-8 bg-gray-50 min-h-screen">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 mb-6 hover:text-blue-600">
                <ArrowLeft size={20} /> Back to Invoices
            </button>

            <form onSubmit={handleSubmit} className="max-w-4xl bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h1 className="text-2xl font-bold mb-6">Create New Invoice</h1>
                
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Client</label>
                        <select 
                            required
                            className="w-full border rounded-lg p-2"
                            value={formData.clientId}
                            onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                        >
                            <option value="">Choose a client...</option>
                            {clients.map(c => (
                                <option key={c._id} value={c._id}>{c.firstName} {c.lastName} - {c.companyName}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                        <input 
                            type="text" required placeholder="e.g. INV-2024-001"
                            className="w-full border rounded-lg p-2"
                            onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <input 
                            type="date" required
                            className="w-full border rounded-lg p-2"
                            onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                        <select 
                            className="w-full border rounded-lg p-2"
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

                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-800">Invoice Items</h3>
                        <button type="button" onClick={handleAddItem} className="text-blue-600 flex items-center gap-1 text-sm font-medium">
                            <Plus size={16} /> Add Item
                        </button>
                    </div>
                    <div className="space-y-4">
                        {formData.items.map((item, index) => (
                            <div key={index} className="flex gap-4 items-start">
                                <div className="flex-1">
                                    <input 
                                        type="text" placeholder="Description" required
                                        className="w-full border rounded-lg p-2"
                                        value={item.description}
                                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                    />
                                </div>
                                <div className="w-24">
                                    <input 
                                        type="number" placeholder="Qty" min="1" required
                                        className="w-full border rounded-lg p-2"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                    />
                                </div>
                                <div className="w-32">
                                    <input 
                                        type="number" placeholder="Rate" min="0" required
                                        className="w-full border rounded-lg p-2"
                                        value={item.rate}
                                        onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                                    />
                                </div>
                                {formData.items.length > 1 && (
                                    <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 p-2">
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8 border-t pt-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea 
                            className="w-full border rounded-lg p-2" rows="3"
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        ></textarea>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Tax Rate (%)</span>
                            <input 
                                type="number" className="w-20 border rounded p-1 text-right"
                                value={formData.taxRate}
                                onChange={(e) => setFormData({...formData, taxRate: Number(e.target.value)})}
                            />
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Discount Amount</span>
                            <input 
                                type="number" className="w-20 border rounded p-1 text-right"
                                value={formData.discount}
                                onChange={(e) => setFormData({...formData, discount: Number(e.target.value)})}
                            />
                        </div>
                    </div>
                </div>

                <button 
                    type="submit" disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                    {loading ? "Saving..." : <><Save size={20} /> Create Invoice</>}
                </button>
            </form>
        </div>
    );
};

export default CreateInvoicePage;