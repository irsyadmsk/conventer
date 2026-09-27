import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Setelah deploy, tab lama bisa meminta potongan kode yang sudah tidak ada.
// Muat ulang sekali saja (dijaga sessionStorage agar tidak berputar).
window.addEventListener('vite:preloadError', (e) => {
  try {
    if (sessionStorage.getItem('ruang:muat-ulang-chunk')) return
    sessionStorage.setItem('ruang:muat-ulang-chunk', '1')
  } catch {
    /* penyimpanan diblokir: tetap coba sekali */
  }
  e.preventDefault()
  location.reload()
})
window.addEventListener('load', () => {
  try {
    setTimeout(() => sessionStorage.removeItem('ruang:muat-ulang-chunk'), 10_000)
  } catch {
    /* abaikan */
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
