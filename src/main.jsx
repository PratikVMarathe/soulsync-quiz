import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import QuizErrorBoundary from './components/QuizErrorBoundary'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QuizErrorBoundary
      fallbackState={{
        message: 'The quiz app could not finish loading. Please reload and try again.',
        statusCode: 500,
        title: 'Quiz Failed To Start',
      }}
    >
      <App />
    </QuizErrorBoundary>
  </StrictMode>,
)
