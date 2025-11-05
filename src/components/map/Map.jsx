/**
 * PROFESSIONAL MAP COMPONENT
 *
 * Features:
 * - Multiple map styles (Standard, Satellite, Dark, Terrain)
 * - Marker clustering for better performance
 * - Auto-location with custom controls
 * - Professional UI like Google Maps
 * - Custom markers for charging stations
 * - Interactive popups with station details
 */

import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { renderToStaticMarkup } from "react-dom/server";
import {
  IoFlash,
  IoCloseCircle,
  IoLocationSharp,
  IoNavigate,
  IoPower,
  IoBatteryCharging,
  IoPerson,
  IoTime,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoCarSport,
} from "react-icons/io5";
import { useChargingStations } from "../../hooks/useChargingStations.js";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "../../assets/styles/ProfessionalMap.css";
import "../../assets/styles/utilities.css";

// ==================== CONSTANTS ====================

const DEFAULT_CENTER = [10.7769, 106.7009]; // Ho Chi Minh City
const DEFAULT_ZOOM = 12;
const LOCATE_ZOOM = 16;
const MAX_ZOOM = 19;

// Map Style URLs
const MAP_STYLES = {
  STANDARD: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  SATELLITE:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  DARK: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  TERRAIN:
    "https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png",
  STREETS:
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format distance using Leaflet's built-in distance calculation
 * @param {L.LatLng} from - Starting point
 * @param {L.LatLng} to - Destination point
 * @returns {string} Formatted distance string
 */
const formatDistance = (from, to) => {
  const distance = from.distanceTo(to); // Returns distance in meters

  if (distance < 1000) {
    return `${Math.round(distance)} m`;
  }
  return `${(distance / 1000).toFixed(1)} km`;
};

// ==================== CUSTOM ICONS ====================

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Create custom divIcon for active stations
const createActiveStationIcon = () => {
  const iconMarkup = renderToStaticMarkup(
    <div
      style={{
        width: "40px",
        height: "50px",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        filter: "drop-shadow(0 3px 8px rgba(0, 0, 0, 0.3))",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "35px",
          height: "35px",
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          borderRadius: "50% 50% 50% 0",
          transform: "rotate(-45deg)",
          border: "3px solid white",
          boxShadow: "0 3px 10px rgba(0, 0, 0, 0.25)",
          top: "7px",
          left: "50%",
          marginLeft: "-17.5px",
        }}
      ></div>
      <IoFlash
        style={{
          position: "absolute",
          zIndex: 2,
          fontSize: "20px",
          color: "white",
          top: "13px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />
    </div>
  );

  return L.divIcon({
    className: "custom-station-marker",
    html: iconMarkup,
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -50],
  });
};

// Create custom divIcon for inactive stations
const createInactiveStationIcon = () => {
  const iconMarkup = renderToStaticMarkup(
    <div
      style={{
        width: "40px",
        height: "50px",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        filter: "drop-shadow(0 3px 8px rgba(0, 0, 0, 0.3))",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "35px",
          height: "35px",
          background: "linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)",
          borderRadius: "50% 50% 50% 0",
          transform: "rotate(-45deg)",
          border: "3px solid white",
          boxShadow: "0 3px 10px rgba(0, 0, 0, 0.25)",
          top: "7px",
          left: "50%",
          marginLeft: "-17.5px",
        }}
      ></div>
      <IoCloseCircle
        style={{
          position: "absolute",
          zIndex: 2,
          fontSize: "20px",
          color: "white",
          top: "13px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />
    </div>
  );

  return L.divIcon({
    className: "custom-station-marker",
    html: iconMarkup,
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -50],
  });
};

// User location icon
const createUserLocationIcon = () =>
  L.divIcon({
    className: "user-location-marker",
    html: `
    <div class="user-location-pin">
      <div class="pulse-ring"></div>
      <div class="location-dot"></div>
    </div>
  `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

// ==================== CUSTOM CONTROLS ====================

/**
 * Auto-locate control with professional UI
 */
function AutoLocate({ setUserLocation }) {
  const map = useMap();
  const userMarkerRef = useRef(null);

  useMapEvents({
    locationfound(e) {
      setUserLocation(e.latlng);

      // Remove old marker if exists
      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
      }

      // Create new marker with custom icon
      const marker = L.marker(e.latlng, {
        icon: createUserLocationIcon(),
      }).addTo(map);
      const coords = `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`;

      const locationIconMarkup = renderToStaticMarkup(
        <IoLocationSharp style={{ fontSize: "20px", color: "#10b981" }} />
      );

      marker
        .bindPopup(
          `
        <div class="user-location-popup">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            ${locationIconMarkup}
            <h5 style="margin: 0; color: #10b981;">Vị trí của bạn</h5>
          </div>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Tọa độ:</strong> ${coords}</p>
        </div>
      `
        )
        .openPopup();

      userMarkerRef.current = marker;
      map.setView(e.latlng, LOCATE_ZOOM);
    },
    locationerror(e) {
      const alertIconMarkup = renderToStaticMarkup(
        <IoAlertCircle style={{ fontSize: "20px", color: "#ff4d4f" }} />
      );

      L.popup()
        .setLatLng(map.getCenter())
        .setContent(
          `
          <div class="location-error-popup">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              ${alertIconMarkup}
              <h4 style="margin: 0; color: #ff4d4f;">Không thể lấy vị trí</h4>
            </div>
            <p style="margin: 4px 0; font-size: 13px;">${e.message}</p>
          </div>
        `
        )
        .openOn(map);
      console.error("Location error:", e.message);
    },
  });

  useEffect(() => {
    // Create custom locate button - above station info panel
    const locateControl = L.control({ position: "bottomleft" });

    locateControl.onAdd = function () {
      const container = L.DomUtil.create("div", "custom-locate-control");

      const navigateIconMarkup = renderToStaticMarkup(
        <IoNavigate style={{ fontSize: "24px", color: "white" }} />
      );

      container.innerHTML = `
        <button class="custom-locate-btn" title="Về vị trí của tôi">
          ${navigateIconMarkup}
        </button>
      `;

      L.DomEvent.disableClickPropagation(container);

      const btn = container.querySelector(".custom-locate-btn");
      L.DomEvent.on(btn, "click", (e) => {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);
        btn.classList.add("locating");
        map.locate({
          setView: true,
          maxZoom: LOCATE_ZOOM,
          enableHighAccuracy: true,
        });
        setTimeout(() => btn.classList.remove("locating"), 1000);
      });

      return container;
    };

    locateControl.addTo(map);

    // Auto-locate on mount (without setting view)
    map.locate({
      setView: false,
      maxZoom: LOCATE_ZOOM,
      enableHighAccuracy: true,
    });

    return () => locateControl.remove();
  }, [map]);

  return null;
}

/**
 * Map style control
 */
function MapStyleControl() {
  const map = useMap();
  const [currentStyle, setCurrentStyle] = useState("STANDARD");

  useEffect(() => {
    const styleControl = L.control({ position: "topright" });

    styleControl.onAdd = function () {
      const container = L.DomUtil.create(
        "div",
        "leaflet-bar map-style-control"
      );
      container.innerHTML = `
        <select class="map-style-select" title="Chọn kiểu bản đồ">
          <option value="STANDARD">Bản đồ</option>
          <option value="SATELLITE">Vệ tinh</option>
          <option value="DARK">Tối</option>
          <option value="STREETS">Đường phố</option>
        </select>
      `;

      L.DomEvent.disableClickPropagation(container);

      const select = container.querySelector(".map-style-select");
      L.DomEvent.on(select, "change", (e) => {
        setCurrentStyle(e.target.value);
      });

      return container;
    };

    styleControl.addTo(map);
    return () => styleControl.remove();
  }, [map]);

  return null;
}

/**
 * Custom Zoom Control - positioned at top-left
 */
function CustomZoomControl() {
  const map = useMap();

  useEffect(() => {
    const zoomControl = L.control({ position: "topleft" });

    zoomControl.onAdd = function () {
      const container = L.DomUtil.create(
        "div",
        "leaflet-bar custom-zoom-control"
      );

      container.innerHTML = `
        <a class="custom-zoom-in" href="#" title="Zoom in" role="button" aria-label="Zoom in">
          <span aria-hidden="true">+</span>
        </a>
        <a class="custom-zoom-out" href="#" title="Zoom out" role="button" aria-label="Zoom out">
          <span aria-hidden="true">−</span>
        </a>
      `;

      L.DomEvent.disableClickPropagation(container);

      const zoomInBtn = container.querySelector(".custom-zoom-in");
      const zoomOutBtn = container.querySelector(".custom-zoom-out");

      L.DomEvent.on(zoomInBtn, "click", (e) => {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);
        map.zoomIn();
      });

      L.DomEvent.on(zoomOutBtn, "click", (e) => {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);
        map.zoomOut();
      });

      return container;
    };

    zoomControl.addTo(map);
    return () => zoomControl.remove();
  }, [map]);

  return null;
}

/**
 * Station info control - shows statistics
 */
function StationInfoControl({ stations }) {
  const map = useMap();

  useEffect(() => {
    const infoControl = L.control({ position: "bottomleft" });

    infoControl.onAdd = function () {
      const container = L.DomUtil.create(
        "div",
        "leaflet-bar station-info-control"
      );

      const activeCount = stations.filter((s) => s.active).length;
      const totalSlots = stations.reduce(
        (sum, s) => sum + (s.availableSlots || 0),
        0
      );

      const flashIconMarkup = renderToStaticMarkup(
        <IoFlash className="info-icon-svg" style={{ color: "#1890ff" }} />
      );
      const checkmarkIconMarkup = renderToStaticMarkup(
        <IoCheckmarkCircle
          className="info-icon-svg"
          style={{ color: "#10b981" }}
        />
      );
      const powerIconMarkup = renderToStaticMarkup(
        <IoPower className="info-icon-svg" style={{ color: "#1890ff" }} />
      );

      container.innerHTML = `
        <div class="info-item">
          ${flashIconMarkup}
          <div>
            <div class="info-value">${stations.length}</div>
            <div class="info-label">Trạm sạc</div>
          </div>
        </div>
        <div class="info-item">
          ${checkmarkIconMarkup}
          <div>
            <div class="info-value">${activeCount}</div>
            <div class="info-label">Hoạt động</div>
          </div>
        </div>
        <div class="info-item">
          ${powerIconMarkup}
          <div>
            <div class="info-value">${totalSlots}</div>
            <div class="info-label">Trụ trống</div>
          </div>
        </div>
      `;

      L.DomEvent.disableClickPropagation(container);

      return container;
    };

    if (stations.length > 0) {
      infoControl.addTo(map);
    }

    return () => infoControl.remove();
  }, [map, stations]);

  return null;
}

// ==================== STATION MARKERS ====================

/**
 * Clustered station markers with professional styling using Leaflet.markercluster
 */
function StationMarkers({ stations, onStationClick, userLocation }) {
  const map = useMap();
  const markersClusterRef = useRef(null);

  useEffect(() => {
    if (!stations || stations.length === 0) return;

    // Remove existing cluster layer if any
    if (markersClusterRef.current) {
      map.removeLayer(markersClusterRef.current);
    }

    // Create cluster group with custom icon
    const markersCluster = L.markerClusterGroup({
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: true,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let size = "small";
        let className = "marker-cluster-small";

        if (count > 10) {
          size = "medium";
          className = "marker-cluster-medium";
        }
        if (count > 50) {
          size = "large";
          className = "marker-cluster-large";
        }

        return L.divIcon({
          html: `<div class="cluster-marker ${size}"><span>${count}</span></div>`,
          className: `marker-cluster ${className}`,
          iconSize: L.point(50, 50),
        });
      },
    });

    // Add markers to cluster
    stations.forEach((station) => {
      if (!station.lat || !station.lng) {
        console.warn(`Station ${station.id} missing coordinates`);
        return;
      }

      const position = [station.lat, station.lng];
      const icon = station.active
        ? createActiveStationIcon()
        : createInactiveStationIcon();

      const marker = L.marker(position, { icon });

      // Calculate distance if user location is available
      let distanceText = null;
      if (userLocation) {
        const stationLatLng = L.latLng(station.lat, station.lng);
        distanceText = formatDistance(userLocation, stationLatLng);
        console.log(
          "Distance calculated:",
          distanceText,
          "from",
          userLocation,
          "to",
          stationLatLng
        );
      } else {
        console.log("User location not available yet");
      }

      const stationIconMarkup = station.active
        ? renderToStaticMarkup(
            <IoFlash style={{ fontSize: "32px", color: "#10b981" }} />
          )
        : renderToStaticMarkup(
            <IoCloseCircle style={{ fontSize: "32px", color: "#ff4d4f" }} />
          );

      const popupContent = `
        <div class="station-popup-pro">
          <div class="popup-header">
            <div class="station-icon">
              ${stationIconMarkup}
            </div>
            <div class="station-title">
              <h3>${station.name}</h3>
              <span class="status-badge ${
                station.active ? "active" : "inactive"
              }">
                ${station.active ? "● Hoạt động" : "● Bảo trì"}
              </span>
            </div>
          </div>
          
          <div class="popup-content">
            ${
              distanceText
                ? `<div class="info-row">
              ${renderToStaticMarkup(
                <IoNavigate className="icon-svg" style={{ color: "#1890ff" }} />
              )}
              <div class="info-text">
                <span class="label">Khoảng cách</span>
                <span class="value"><strong class="highlight">${distanceText}</strong></span>
              </div>
            </div>`
                : ""
            }
            
            <div class="info-row">
              ${renderToStaticMarkup(<IoLocationSharp className="icon-svg" />)}
              <div class="info-text">
                <span class="label">Địa chỉ</span>
                <span class="value">${station.address}</span>
              </div>
            </div>
            
            <div class="info-row">
              ${renderToStaticMarkup(<IoPower className="icon-svg" />)}
              <div class="info-text">
                <span class="label">Trụ sạc khả dụng</span>
                <span class="value">
                  <strong class="highlight">${station.availableSlots}</strong>
                  /${station.totalSlots} trống
                </span>
              </div>
            </div>
          </div>
          
          <div class="popup-footer">
            <button class="btn-view-details" data-station-id="${station.id}">
              Xem chi tiết
            </button>
            ${
              userLocation
                ? `<button class="btn-get-directions" data-station-id="${
                    station.id
                  }" data-lat="${station.lat}" data-lng="${station.lng}">
              ${renderToStaticMarkup(
                <IoCarSport style={{ marginRight: "6px" }} />
              )}
              Chỉ đường
            </button>`
                : ""
            }
          </div>
        </div>
      `;

      const popup = L.popup({
        maxWidth: 380,
        minWidth: 300,
        className: "custom-popup",
        closeButton: true,
        autoPan: true,
        autoPanPadding: [50, 50],
      }).setContent(popupContent);

      marker.bindPopup(popup);

      // Add click handler for buttons in popup
      marker.on("popupopen", () => {
        const detailBtn = document.querySelector(
          `button[data-station-id="${station.id}"].btn-view-details`
        );
        if (detailBtn) {
          detailBtn.onclick = (e) => {
            e.stopPropagation();
            if (onStationClick) {
              onStationClick(station);
            }
          };
        }

        // Add click handler for "Chỉ đường" button
        const directionsBtn = document.querySelector(
          `button[data-station-id="${station.id}"].btn-get-directions`
        );
        console.log(
          "🔍 Directions button found:",
          directionsBtn,
          "User location:",
          userLocation
        );

        if (directionsBtn && userLocation) {
          directionsBtn.onclick = (e) => {
            e.stopPropagation();
            e.preventDefault();

            const lat = parseFloat(directionsBtn.dataset.lat);
            const lng = parseFloat(directionsBtn.dataset.lng);

            console.log(
              "🎯 Directions button clicked! From:",
              userLocation,
              "To:",
              { lat, lng }
            );

            // Trigger routing by dispatching custom event
            const event = new CustomEvent("showRoute", {
              detail: {
                from: userLocation,
                to: L.latLng(lat, lng),
                stationName: station.name,
              },
            });
            window.dispatchEvent(event);
            console.log("📡 showRoute event dispatched");
          };
        } else {
          console.warn(
            "⚠️ Cannot add directions handler - button:",
            !!directionsBtn,
            "userLocation:",
            !!userLocation
          );
        }
      });

      markersCluster.addLayer(marker);
    });

    // Add cluster to map
    map.addLayer(markersCluster);
    markersClusterRef.current = markersCluster;

    // Cleanup
    return () => {
      if (markersClusterRef.current) {
        map.removeLayer(markersClusterRef.current);
      }
    };
  }, [stations, map, onStationClick, userLocation]); // Add userLocation to dependencies

  return null;
}

/**
 * Routing Control Component
 * Handles navigation/directions to stations
 */
function RoutingControl({ userLocation }) {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!userLocation) {
      console.log("⚠️ Routing: User location not available yet");
      return;
    }

    console.log("✅ Routing control ready with user location:", userLocation);

    const handleShowRoute = (event) => {
      console.log("🗺️ Show route event received:", event.detail);
      const { from, to, stationName } = event.detail;

      // Check if L.Routing is available
      if (!L.Routing) {
        console.error(
          "❌ L.Routing is not available. Please check if leaflet-routing-machine is loaded."
        );
        alert("Tính năng chỉ đường chưa sẵn sàng. Vui lòng tải lại trang.");
        return;
      }

      // Remove existing routing control if any
      if (routingControlRef.current) {
        console.log("🧹 Removing old routing control");
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }

      console.log("🚀 Creating routing control from", from, "to", to);

      // Create new routing control
      const routingControl = L.Routing.control({
        waypoints: [L.latLng(from.lat, from.lng), L.latLng(to.lat, to.lng)],
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: true, // Enable alternative routes
        lineOptions: {
          styles: [{ color: "#10b981", opacity: 0.8, weight: 6 }],
          extendToWaypoints: false,
          missingRouteTolerance: 0,
        },
        altLineOptions: {
          styles: [
            { color: "#94a3b8", opacity: 0.4, weight: 4, dashArray: "5, 10" },
          ],
          extendToWaypoints: false,
          missingRouteTolerance: 0,
        },
        createMarker: function () {
          return null;
        }, // Don't create default markers
        router: L.Routing.osrmv1({
          serviceUrl: "https://router.project-osrm.org/route/v1",
        }),
        formatter: new L.Routing.Formatter({
          units: "metric",
          unitNames: {
            meters: "m",
            kilometers: "km",
            yards: "yd",
            miles: "mi",
            hours: "giờ",
            minutes: "phút",
            seconds: "giây",
          },
        }),
        collapsible: true,
        collapsed: true, // Collapse the routing panel by default
        show: false, // Don't show the routing panel initially
      }).addTo(map);

      // Hide the routing control panel (we'll show custom popup instead)
      const routingContainer = routingControl.getContainer();
      if (routingContainer) {
        routingContainer.style.display = "none";
      }

      // Store routes in a variable accessible to event handlers
      let allRoutes = [];
      let customRouteLines = []; // Store custom route lines

      // Customize the routing instructions panel
      routingControl.on("routesfound", function (e) {
        allRoutes = e.routes; // Save routes for later use
        const routes = e.routes;
        const selectedRoute = routes[0]; // Default to first route
        const summary = selectedRoute.summary;
        const instructions = selectedRoute.instructions;

        // Format distance and time
        const distance = (summary.totalDistance / 1000).toFixed(1);
        const time = Math.round(summary.totalTime / 60);

        console.log(
          `🚗 Tuyến đường đến ${stationName}: ${distance} km, ${time} phút`
        );
        console.log(`📍 Tìm thấy ${routes.length} tuyến đường`);

        // Hide default routing lines after a short delay
        setTimeout(() => {
          map.eachLayer((layer) => {
            if (
              layer instanceof L.Polyline &&
              layer.options &&
              layer.options.className === "leaflet-routing-line"
            ) {
              layer.setStyle({ opacity: 0, weight: 0 });
            }
          });

          // Draw custom route lines with proper styling
          routes.forEach((route, idx) => {
            const coords = route.coordinates.map((coord) => [
              coord.lat,
              coord.lng,
            ]);
            const isSelected = idx === 0;

            const routeLine = L.polyline(coords, {
              color: isSelected ? "#10b981" : "#94a3b8",
              opacity: isSelected ? 0.9 : 0.3,
              weight: isSelected ? 7 : 4,
              dashArray: isSelected ? null : "5, 10",
              className: "custom-route-line",
              interactive: false,
            }).addTo(map);

            customRouteLines.push(routeLine);

            if (isSelected) {
              routeLine.bringToFront();
            }
          });
        }, 100);

        // Build instructions in Vietnamese
        const vietnameseInstructions = instructions
          .map((instruction, index) => {
            const dist =
              instruction.distance < 1000
                ? `${Math.round(instruction.distance)} m`
                : `${(instruction.distance / 1000).toFixed(1)} km`;

            // Translate directions to Vietnamese
            let direction = instruction.text;
            direction = direction
              .replace(/Head/g, "Đi")
              .replace(/Turn left/g, "Rẽ trái")
              .replace(/Turn right/g, "Rẽ phải")
              .replace(/Continue/g, "Tiếp tục")
              .replace(/Slight left/g, "Hơi rẽ trái")
              .replace(/Slight right/g, "Hơi rẽ phải")
              .replace(/Sharp left/g, "Rẽ gắt trái")
              .replace(/Sharp right/g, "Rẽ gắt phải")
              .replace(/You have arrived/g, "Bạn đã đến nơi")
              .replace(/north/g, "hướng Bắc")
              .replace(/south/g, "hướng Nam")
              .replace(/east/g, "hướng Đông")
              .replace(/west/g, "hướng Tây");

            return `
            <div class="route-instruction-item">
              <div class="instruction-number">${index + 1}</div>
              <div class="instruction-content">
                <div class="instruction-text">${direction}</div>
                <div class="instruction-distance">${dist}</div>
              </div>
            </div>
          `;
          })
          .join("");

        // Build alternative routes selector if multiple routes
        let alternativeRoutesHTML = "";
        if (routes.length > 1) {
          alternativeRoutesHTML = `
            <div class="route-alternatives">
              <div class="alternatives-header">Chọn tuyến đường khác:</div>
              ${routes
                .map((route, index) => {
                  const routeDist = (
                    route.summary.totalDistance / 1000
                  ).toFixed(1);
                  const routeTime = Math.round(route.summary.totalTime / 60);
                  const isSelected = index === 0;
                  return `
                  <button class="route-alternative-btn ${
                    isSelected ? "selected" : ""
                  }" data-route-index="${index}">
                    <div class="route-alt-label">Tuyến ${index + 1}</div>
                    <div class="route-alt-info">
                      <span>📍 ${routeDist} km</span>
                      <span>⏱️ ${routeTime} phút</span>
                    </div>
                  </button>
                `;
                })
                .join("")}
            </div>
          `;
        }

        // Show enhanced panel with instructions
        const carIconMarkup = renderToStaticMarkup(
          <IoCarSport style={{ fontSize: "24px", color: "#10b981" }} />
        );
        const navigateIconMarkup = renderToStaticMarkup(
          <IoNavigate style={{ fontSize: "18px", color: "#1890ff" }} />
        );
        const timeIconMarkup = renderToStaticMarkup(
          <IoTime style={{ fontSize: "18px", color: "#fa8c16" }} />
        );

        const panelContent = `
          <div class="route-popup-enhanced">
            <div class="route-popup-header">
              <div class="route-icon">${carIconMarkup}</div>
              <div class="route-header-text">
                <h3>Chỉ đường đến trạm</h3>
                <p>${stationName}</p>
              </div>
            </div>
            
            <div class="route-summary">
              <div class="route-summary-item">
                <div class="summary-icon">${navigateIconMarkup}</div>
                <div class="summary-content">
                  <div class="summary-label">Khoảng cách</div>
                  <div class="summary-value">${distance} km</div>
                </div>
              </div>
              <div class="route-summary-item">
                <div class="summary-icon">${timeIconMarkup}</div>
                <div class="summary-content">
                  <div class="summary-label">Thời gian dự kiến</div>
                  <div class="summary-value">~${time} phút</div>
                </div>
              </div>
            </div>
            
            ${alternativeRoutesHTML}
            
            <div class="route-instructions-header">
              <strong>📍 Hướng dẫn chi tiết</strong>
            </div>
            <div class="route-instructions" id="routeInstructions">
              ${vietnameseInstructions}
            </div>
            
            <div class="route-popup-footer">
              <button class="clear-route-btn-popup" id="clearRouteBtn">
                ✕ Xóa tuyến đường
              </button>
              <small>💡 Tuyến đường được tính theo OSRM</small>
            </div>
          </div>
        `;

        // Remove old panel if exists
        const oldPanel = document.getElementById("customRoutePanel");
        if (oldPanel) {
          oldPanel.remove();
        }

        // Create custom control panel
        const RoutePanel = L.Control.extend({
          options: {
            position: "topright",
          },
          onAdd: function () {
            const container = L.DomUtil.create(
              "div",
              "custom-route-panel leaflet-bar"
            );
            container.id = "customRoutePanel";
            container.innerHTML = panelContent;

            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.disableScrollPropagation(container);

            return container;
          },
        });

        const routePanel = new RoutePanel();
        routePanel.addTo(map);

        // Add event listeners after panel is added
        setTimeout(() => {
          // Clear route button
          const clearBtn = document.getElementById("clearRouteBtn");
          if (clearBtn) {
            clearBtn.onclick = (e) => {
              e.stopPropagation();

              // Remove custom route lines
              customRouteLines.forEach((line) => {
                map.removeLayer(line);
              });
              customRouteLines = [];

              // Remove all route lines from map (including default ones)
              const routeLayers = [];
              map.eachLayer((layer) => {
                if (
                  layer instanceof L.Polyline &&
                  layer.options &&
                  (layer.options.className === "leaflet-routing-line" ||
                    layer.options.className === "custom-route-line")
                ) {
                  routeLayers.push(layer);
                }
              });
              routeLayers.forEach((layer) => {
                map.removeLayer(layer);
              });

              // Remove routing control
              if (routingControlRef.current) {
                map.removeControl(routingControlRef.current);
                routingControlRef.current = null;
              }

              // Remove panel
              const panel = document.getElementById("customRoutePanel");
              if (panel) panel.remove();

              console.log("🧹 Route cleared completely");
            };
          }

          // Alternative route buttons
          const altBtns = document.querySelectorAll(".route-alternative-btn");
          altBtns.forEach((btn) => {
            btn.onclick = (e) => {
              e.stopPropagation();
              const routeIndex = parseInt(btn.dataset.routeIndex);
              console.log(
                `🔘 Clicked route button ${routeIndex + 1}, available routes:`,
                allRoutes.length
              );
              const selectedRoute = allRoutes[routeIndex];

              // Update button states
              altBtns.forEach((b) => b.classList.remove("selected"));
              btn.classList.add("selected");

              // Update route summary (distance and time)
              const distance = (
                selectedRoute.summary.totalDistance / 1000
              ).toFixed(1);
              const time = Math.round(selectedRoute.summary.totalTime / 60);

              const distanceEl = document.querySelector(
                ".route-summary .summary-value"
              );
              const timeEl = document.querySelectorAll(
                ".route-summary .summary-value"
              )[1];
              if (distanceEl) distanceEl.textContent = `${distance} km`;
              if (timeEl) timeEl.textContent = `~${time} phút`;

              // Update styling of existing custom route lines
              console.log(
                `🎨 Updating ${customRouteLines.length} routes, selected: ${
                  routeIndex + 1
                }`
              );
              customRouteLines.forEach((routeLine, idx) => {
                const isSelected = idx === routeIndex;

                routeLine.setStyle({
                  color: isSelected ? "#10b981" : "#94a3b8",
                  opacity: isSelected ? 0.9 : 0.3,
                  weight: isSelected ? 7 : 4,
                  dashArray: isSelected ? null : "5, 10",
                });

                // Bring selected route to front
                if (isSelected) {
                  routeLine.bringToFront();
                }
              });

              // Fit map to selected route only
              const selectedCoords = selectedRoute.coordinates.map((coord) => [
                coord.lat,
                coord.lng,
              ]);
              const selectedLine = L.polyline(selectedCoords);
              map.fitBounds(selectedLine.getBounds(), { padding: [50, 50] });

              // Update instructions
              const newInstructions = selectedRoute.instructions
                .map((instruction, index) => {
                  const dist =
                    instruction.distance < 1000
                      ? `${Math.round(instruction.distance)} m`
                      : `${(instruction.distance / 1000).toFixed(1)} km`;

                  let direction = instruction.text;
                  direction = direction
                    .replace(/Head/g, "Đi")
                    .replace(/Turn left/g, "Rẽ trái")
                    .replace(/Turn right/g, "Rẽ phải")
                    .replace(/Continue/g, "Tiếp tục")
                    .replace(/Slight left/g, "Hơi rẽ trái")
                    .replace(/Slight right/g, "Hơi rẽ phải")
                    .replace(/Sharp left/g, "Rẽ gắt trái")
                    .replace(/Sharp right/g, "Rẽ gắt phải")
                    .replace(/You have arrived/g, "Bạn đã đến nơi")
                    .replace(/north/g, "hướng Bắc")
                    .replace(/south/g, "hướng Nam")
                    .replace(/east/g, "hướng Đông")
                    .replace(/west/g, "hướng Tây");

                  return `
                  <div class="route-instruction-item">
                    <div class="instruction-number">${index + 1}</div>
                    <div class="instruction-content">
                      <div class="instruction-text">${direction}</div>
                      <div class="instruction-distance">${dist}</div>
                    </div>
                  </div>
                `;
                })
                .join("");

              const instructionsContainer =
                document.getElementById("routeInstructions");
              if (instructionsContainer) {
                instructionsContainer.innerHTML = newInstructions;
              }

              console.log(
                `🔄 Switched to route ${
                  routeIndex + 1
                }: ${distance}km, ${time}min`
              );
            };
          });
        }, 100);
      });

      routingControlRef.current = routingControl;
    };

    // Listen for custom route event
    window.addEventListener("showRoute", handleShowRoute);

    return () => {
      window.removeEventListener("showRoute", handleShowRoute);
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, userLocation]);

  return null;
}

// ==================== MAIN COMPONENT ====================

/**
 * Professional map component with advanced features
 */
function Map({ onStationClick }) {
  const { stations, loading, error } = useChargingStations({ autoFetch: true });
  const [mapReady, setMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (stations.length > 0) {
      console.log("📍 Stations loaded on map:", stations.length);
    }
  }, [stations]);

  return (
    <div className="professional-map-wrapper">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        maxZoom={MAX_ZOOM}
        className="professional-map-container"
        zoomControl={false}
        whenReady={() => setMapReady(true)}
      >
        {/* Base map tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={MAP_STYLES.STANDARD}
          maxZoom={MAX_ZOOM}
        />

        {/* Custom controls */}
        <CustomZoomControl />
        <AutoLocate setUserLocation={setUserLocation} />
        <StationInfoControl stations={stations} />
        <RoutingControl userLocation={userLocation} />

        {/* Station markers with clustering */}
        {!loading && !error && mapReady && (
          <StationMarkers
            stations={stations}
            onStationClick={onStationClick}
            userLocation={userLocation}
          />
        )}
      </MapContainer>
    </div>
  );
}

export default Map;
