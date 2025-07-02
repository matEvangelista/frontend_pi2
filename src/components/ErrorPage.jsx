import React from 'react';

function ErrorPage() {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: '100vh' }}>
      <h1 className="display-4">404</h1>
      <p className="lead">Oops! A página que você está procurando não existe.</p>
      <a href="/" className="btn btn-primary mt-3">Go to Home</a>
    </div>
  );
}

export default ErrorPage; 