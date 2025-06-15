import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ApolloProvider } from "@apollo/client";
import { client } from "@/graphql/client";
import App from './App'
import './index.css'
import AppGate from './components/section/app-gate';
import { AuthProvider } from './lib/auth';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <AuthProvider>
        <AppGate>
          <App />
        </AppGate>
      </AuthProvider>
    </ApolloProvider>
  </StrictMode>,
)
