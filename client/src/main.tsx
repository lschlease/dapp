import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {TransactionsProvider}  from './context/TransactionContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <TransactionsProvider>
    <App />
  </TransactionsProvider>,
)
