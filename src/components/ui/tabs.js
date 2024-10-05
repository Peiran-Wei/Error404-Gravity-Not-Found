import React, { useState } from 'react';

export const Tabs = ({ defaultValue, children }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <div>
      {React.Children.map(children, (child) => {
        if (child.type === TabsList) {
          return React.cloneElement(child, { activeTab, setActiveTab });
        }
        return React.cloneElement(child, { activeTab });
      })}
    </div>
  );
};

export const TabsList = ({ children, activeTab, setActiveTab }) => (
  <div className="flex border-b">
    {React.Children.map(children, (child) =>
      React.cloneElement(child, { activeTab, setActiveTab })
    )}
  </div>
);

export const TabsTrigger = ({ value, children, activeTab, setActiveTab }) => (
  <button
    className={`px-4 py-2 ${activeTab === value ? 'border-b-2 border-blue-500' : ''}`}
    onClick={() => setActiveTab(value)}
  >
    {children}
  </button>
);

export const TabsContent = ({ value, children, activeTab }) => {
  if (activeTab !== value) return null;
  return <div className="p-4">{children}</div>;
};