import { Button, Input, Space, Row, Col, Card, Typography, Skeleton } from 'antd'
import { EnvironmentOutlined, CloseOutlined, AimOutlined } from '@ant-design/icons'

import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from '@react-google-maps/api'
import { useRef, useState } from 'react'

const { Text } = Typography

const center = { lat: 21.0285, lng: 105.8542 }

function GGMap() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  })

  const [map, setMap] = useState(/** @type google.maps.Map */ (null))
  const [directionsResponse, setDirectionsResponse] = useState(null)
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')

  /** @type React.MutableRefObject<HTMLInputElement> */
  const originRef = useRef()
  /** @type React.MutableRefObject<HTMLInputElement> */
  const destiantionRef = useRef()

  if (!isLoaded) {
    return <Skeleton active />
  }

  async function calculateRoute() {
    if (originRef.current.input.value === '' || destiantionRef.current.input.value === '') {
      return
    }
    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService()
    const results = await directionsService.route({
      origin: originRef.current.input.value,
      destination: destiantionRef.current.input.value,
      // eslint-disable-next-line no-undef
      travelMode: google.maps.TravelMode.DRIVING,
    })
    setDirectionsResponse(results)
    setDistance(results.routes[0].legs[0].distance.text)
    setDuration(results.routes[0].legs[0].duration.text)
  }

  function clearRoute() {
    setDirectionsResponse(null)
    setDistance('')
    setDuration('')
    originRef.current.input.value = ''
    destiantionRef.current.input.value = ''
  }

  function centerMap() {
    if (map) {
      map.panTo(center)
      map.setZoom(15)
    } else {
      console.warn('Map not loaded yet')
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100vh',
        width: '100vw'
      }}
    >
      <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '100%' }}>
        {/* Google Map Box */}
        <GoogleMap
          center={center}
          zoom={15}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          options={{
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            disableDefaultUI: true,
            gestureHandling: 'greedy'
          }}
          onLoad={map => setMap(map)}
        >
          <Marker position={center} />
          {directionsResponse && (
            <DirectionsRenderer directions={directionsResponse} />
          )}
        </GoogleMap>
      </div>
      
      <Card
        style={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          minWidth: 600,
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col span={8}>
              <Autocomplete>
                <Input 
                  placeholder="Origin" 
                  ref={originRef}
                  prefix={<EnvironmentOutlined />}
                />
              </Autocomplete>
            </Col>
            <Col span={8}>
              <Autocomplete>
                <Input
                  placeholder="Destination"
                  ref={destiantionRef}
                  prefix={<EnvironmentOutlined />}
                />
              </Autocomplete>
            </Col>
            <Col span={8}>
              <Space>
                <Button type="primary" onClick={calculateRoute}>
                  Calculate Route
                </Button>
                <Button 
                  icon={<CloseOutlined />} 
                  onClick={clearRoute}
                />
              </Space>
            </Col>
          </Row>
          
          <Row gutter={[16, 16]} align="middle" justify="space-between">
            <Col>
              <Text strong>Distance: {distance}</Text>
            </Col>
            <Col>
              <Text strong>Duration: {duration}</Text>
            </Col>
            <Col>
              <Button
                type="primary"
                shape="circle"
                icon={<AimOutlined />}
                onClick={centerMap}
                disabled={!map}
                title="Center map to default location"
              />
            </Col>
          </Row>
        </Space>
      </Card>
    </div>
  )
}

export default GGMap