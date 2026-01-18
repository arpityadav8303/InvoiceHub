import React from 'react';
import { CreditCard, Banknote, Landmark, Smartphone, Wallet } from 'lucide-react';

const PaymentMethodBadge = ({ method }) => {
  // Map methods to specific visual styles and icons
  const styles = {
    'Credit Card': { icon: CreditCard, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800' },
    'Bank Transfer': { icon: Landmark, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800' },
    'Cash': { icon: Banknote, color: 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' },
    'UPI': { icon: Smartphone, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800' },
    'Cheque': { icon: Wallet, color: 'text-gray-600 bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700' },
    'Default': { icon: Banknote, color: 'text-gray-600 bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700' }
  };

  const config = styles[method] || styles['Default'];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${config.color}`}>
      <Icon size={12} />
      {method}
    </span>
  );
};

export default PaymentMethodBadge;