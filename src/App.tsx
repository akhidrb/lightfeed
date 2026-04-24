import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Welcome } from './pages/Welcome';
import { Feed } from './pages/Feed';
import { Saved } from './pages/Saved';
import { Reflections } from './pages/Reflections';
import { SessionDone } from './pages/SessionDone';
import { storage } from './services/storageService';

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={storage.hasVisited() ? <Navigate to="/feed" replace /> : <Welcome />}
      />
      <Route path="/feed"        element={<Feed />} />
      <Route path="/saved"       element={<Saved />} />
      <Route path="/reflections" element={<Reflections />} />
      <Route path="/session-done" element={<SessionDone />} />
      <Route path="*"            element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
