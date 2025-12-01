import { useState } from 'react'
import './App.css'
import { AuthProvider } from './context/AuthContext'
import AppRoutes from './routes/AppRoutes'
import { Toaster } from "react-hot-toast"
function App() {

  return (
    <>
      <AuthProvider>
        <Toaster toastOptions={{
          // Define default options
          className: '',
          duration: 700,
          removeDelay: 1000,
          style: {
            background: '#363636',
            color: '#fff',
          }
        }} />
        <AppRoutes />
      </AuthProvider>
    </>
  )
}

export default App
