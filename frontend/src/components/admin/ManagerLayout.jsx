import React from 'react';

const ManagerLayout = ({ eyebrow, title, subtitle, actions, children }) => {
  return (
    <div className="manager-container">
      <div className="manager-header">
        {eyebrow && (
          <div className="manager-eyebrow">
            {eyebrow}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem' }}>
          <div style={{ flex: 1 }}>
            <h1 className="manager-title">{title}</h1>
            {subtitle && <p className="manager-subtitle">{subtitle}</p>}
          </div>
          {actions && <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>{actions}</div>}
        </div>
      </div>
      {children}
    </div>
  );
};

export default ManagerLayout;
