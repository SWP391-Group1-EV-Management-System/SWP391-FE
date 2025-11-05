import React from "react";
import ShowQR from "../components/virtualstation/ShowQR";
import "../assets/styles/virtualstation/VirtualStationPage.css";
import ShowSession from "../components/virtualstation/ShowSession";
function VirtualStationPage() {
  return (
    <>
      {<ShowQR />}
      <ShowSession />
    </>
  );
}

export default VirtualStationPage;
