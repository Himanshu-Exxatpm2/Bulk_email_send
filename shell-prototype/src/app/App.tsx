import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';

/**
 * App entry — react-router owns navigation; shells own chrome.
 * Styles load via src/styles/index.css from main.tsx.
 * The Toaster is mounted once here so every toast (send confirmations, template actions) is visible.
 */
export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" richColors closeButton />
    </>
  );
}
