import React from 'react';

const NotFound = () => {
  return (
    <div className="container text-center" style={{ padding: '100px 0', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '4rem', color: 'var(--primary-blue)', marginBottom: '16px' }}>404</h1>
      <h2>Page Not Found</h2>
      <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>The page you are looking for does not exist.</p>
      <a href="/" className="btn btn-primary" style={{ marginTop: '32px' }}>Go Home</a>
    </div>
  );
};

export default NotFound;
