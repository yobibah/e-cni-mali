// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,              // reessaie 1 fois en cas d'échec
      staleTime: 1000 * 60,  // cache valide 1 minute
    },
    mutations: {
      retry: 0,              // pas de retry pour les mutations
    }
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter >
      <App  />
    </BrowserRouter>
  </QueryClientProvider>
);