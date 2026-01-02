import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import store from './store/store'
import { Provider } from 'react-redux'
import './index.css'
import router from './routes/routes.ts'

import { RouterProvider } from "react-router/dom";


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)
