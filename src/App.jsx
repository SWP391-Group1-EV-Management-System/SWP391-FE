import React from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import Layout from "./components/layout/Layout.jsx";
import HomePage from "./page/HomePage.jsx";
import MapPage from "./page/MapPage.jsx";
import HistoryPage from "./page/HistoryPage.jsx";
import PaymentPage from "./page/PaymentPage.jsx";
import FavoritePage from "./page/FavoritePage.jsx";
import SettingPage from "./page/SettingPage.jsx";
import NotFoundPage from "./page/NotFoundPage.jsx";
import ShowCharging from "./components/layout/ShowCharging.jsx";
import Login from "./page/Login.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="home" element={<HomePage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="energy" element={<ShowCharging />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="payment" element={<PaymentPage />} />
          <Route path="favorite" element={<FavoritePage />} />
          <Route path="setting" element={<SettingPage />} />
        </Route>
        <Route path="login" element={<Login />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
