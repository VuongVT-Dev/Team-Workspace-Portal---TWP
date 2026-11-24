import React from 'react';
import ConstellationMesh from '../components/lucian/ConstellationMesh';
import LoginModalCard from '../components/auth/LoginModalCard';

const LoginPage = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Interactive Cursor-linked Constellation Mesh Background (Lucian #341) */}
      <ConstellationMesh fullscreen />

      <div className="twp-login-rise-standalone relative z-10 w-full max-w-md">
        <LoginModalCard autoFocus />
      </div>
    </div>
  );
};

export default LoginPage;
