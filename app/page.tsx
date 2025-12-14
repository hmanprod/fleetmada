"use client";

import React, { useEffect } from 'react';
import { AuthProvider } from '../lib/auth-context';
import AuthFlow from '../pages/AuthFlow';

export default function Home() {
  return (
    <AuthProvider>
      <AuthFlow />
    </AuthProvider>
  );
}