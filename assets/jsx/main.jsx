import React from 'react'
import ReactDOM from 'react-dom/client'
// Bootstrap 5 come base (griglia, utilities, componenti)
import 'bootstrap/dist/css/bootstrap.min.css'
// CSS custom per l'identità visiva (palette, animazioni, cerchio lettere)
import './index.css'
import App from './app.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
