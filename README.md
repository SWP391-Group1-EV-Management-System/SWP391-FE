# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

```
SWP391-FE
├─ .env
├─ db.json
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ public
│  └─ vite.svg
├─ README.md
├─ src
│  ├─ App.jsx
│  ├─ assets
│  │  ├─ images
│  │  │  ├─ bg.gif
│  │  │  ├─ Frame 16.png
│  │  │  ├─ Frame1.png
│  │  │  ├─ logo.png
│  │  │  └─ WelcomePageBackground.svg
│  │  └─ styles
│  │     ├─ ArrivalTime.css
│  │     ├─ ElasticSlider.css
│  │     ├─ energy
│  │     │  └─ EnergyPage.css
│  │     ├─ HistoryFilters.css
│  │     ├─ HomePage.css
│  │     ├─ index.css
│  │     ├─ LeafletMap.css
│  │     ├─ Login.css
│  │     ├─ MainContent.css
│  │     ├─ Map.css
│  │     ├─ MapPage.css
│  │     ├─ Menu.css
│  │     ├─ MyNavbar.css
│  │     ├─ NotFoundPage.css
│  │     ├─ OTPVerification.css
│  │     ├─ QRResultModal.css
│  │     ├─ QRScanner.css
│  │     ├─ Register.css
│  │     ├─ ServicePackageCard.css
│  │     ├─ SessionStaff.css
│  │     ├─ StationModal.css
│  │     ├─ utilities.css
│  │     ├─ WaitingQueue.css
│  │     ├─ Welcome.css
│  │     └─ z-index-system.css
│  ├─ components
│  │  ├─ energy
│  │  │  ├─ ArrivalTime.jsx
│  │  │  ├─ BatteryProgress.jsx
│  │  │  ├─ CurrentTime.jsx
│  │  │  ├─ EnergyStats.jsx
│  │  │  ├─ PricingInfo.jsx
│  │  │  ├─ TechnicalDetails.jsx
│  │  │  └─ WaitingQueue.jsx
│  │  ├─ history
│  │  │  ├─ HistoryFilters.jsx
│  │  │  ├─ HistoryList.jsx
│  │  │  ├─ HistorySessionCard.jsx
│  │  │  ├─ HistorySessionDetail.jsx
│  │  │  ├─ HistorySummary.jsx
│  │  │  └─ NoDataMessage.jsx
│  │  ├─ layout
│  │  │  ├─ Layout.jsx
│  │  │  ├─ Menu.jsx
│  │  │  └─ MyNavbar.jsx
│  │  ├─ map
│  │  │  └─ Map.jsx
│  │  ├─ PageHeader.tsx
│  │  ├─ qr
│  │  │  ├─ ElasticSlider.jsx
│  │  │  ├─ QRResultModal.jsx
│  │  │  └─ QRScanner.jsx
│  │  ├─ service
│  │  │  ├─ ServicePackageCard.jsx
│  │  │  ├─ ServicePackageForm.jsx
│  │  │  └─ ServicePackageTable.jsx
│  │  ├─ station
│  │  │  └─ StationModal.jsx
│  │  └─ user
│  │     ├─ DriverTable.jsx
│  │     ├─ ManagerTable.jsx
│  │     ├─ StaffTable.jsx
│  │     └─ UserModal.jsx
│  ├─ hooks
│  │  ├─ useChargingStations.js
│  │  ├─ useEnergySession.js
│  │  ├─ useHistoryData.js
│  │  ├─ useLogin.js
│  │  └─ useStationPosts.js
│  ├─ main.jsx
│  ├─ page
│  │  ├─ EnergyPage.jsx
│  │  ├─ EVAdminDashboard.jsx
│  │  ├─ HistoryPage.jsx
│  │  ├─ HomePage.jsx
│  │  ├─ Login.jsx
│  │  ├─ MapPage.jsx
│  │  ├─ NotFoundPage.jsx
│  │  ├─ OTPVerification.jsx
│  │  ├─ Register.jsx
│  │  ├─ ServicePackage.jsx
│  │  ├─ SessionStaffPage.jsx
│  │  ├─ SettingPage.jsx
│  │  ├─ UserManagementPage.jsx
│  │  ├─ WaitingStaffPage.jsx
│  │  └─ WelcomePage.jsx
│  ├─ services
│  │  ├─ api.js
│  │  ├─ apiService.js
│  │  ├─ authService.js
│  │  ├─ chargingStationService.js
│  │  ├─ energySessionService.js
│  │  └─ historyService.js
│  └─ utils
│     ├─ energyUtils.js
│     └─ historyHelpers.js
└─ vite.config.js

```