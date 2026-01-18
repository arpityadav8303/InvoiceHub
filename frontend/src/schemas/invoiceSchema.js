import { validators } from '../utils/validators';

export const invoiceSchema = {
  clientId: [validators.required],
  date: [validators.required],
  dueDate: [validators.required],
  items: [
    (items) => items && items.length > 0 ? null : 'At least one item is required',
    (items) => {
      // Check if any item is incomplete
      const invalidItem = items.find(item => !item.description || item.quantity <= 0 || item.price < 0);
      return invalidItem ? 'All items must have a description, quantity, and valid price' : null;
    }
  ]
};
