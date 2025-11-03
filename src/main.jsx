import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { PersistGate } from "redux-persist/integration/react";
import { Provider } from "react-redux";
import { store, persistor } from "./store/store.js";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import {
  LoginPage,
  SignupPage,
  PageNotFound,
  HomePage,
  ChatPage,
  SearchPage,
  RequestPage
  
} from "./pages/index.js";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
      { path: "*", element: <PageNotFound /> },
      { path: "/chat/:chatId", element: <ChatPage /> },
      { path: "/search", element: <SearchPage /> },
      { path: "/requests", element: <RequestPage /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <RouterProvider router={router} />
    </PersistGate>
  </Provider>
  // </StrictMode>
);
