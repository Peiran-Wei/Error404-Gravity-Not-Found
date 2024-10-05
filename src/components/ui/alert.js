import React from 'react';

export const Alert = ({ variant, children }) => {
  const getVariantStyles = (variant) => {
    switch (variant) {
      case 'destructive':
        return 'bg-red-100 border-red-400 text-red-700';
      case 'warning':
        return 'bg-yellow-100 border-yellow-400 text-yellow-700';
      case 'success':
        return 'bg-green-100 border-green-400 text-green-700';
      default:
        return 'bg-blue-100 border-blue-400 text-blue-700';
    }
  };

  return (
    <div className={`border-l-4 p-4 ${getVariantStyles(variant)}`}>
      {children}
    </div>
  );
};

export const AlertTitle = ({ children }) => (
  <h4 className="font-bold mb-2">{children}</h4>
);

export const AlertDescription = ({ children }) => (
  <p>{children}</p>
);