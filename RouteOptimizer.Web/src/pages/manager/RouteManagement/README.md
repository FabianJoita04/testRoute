# Route Management System

A comprehensive route management interface for the Bucharest public transport system with full CRUD operations, interactive mapping, and real-time visualization.

## Features

### 1. Route List/Table View
- **Comprehensive Route Information**
  - Route code and name
  - Start and end points
  - Number of stops
  - Operating hours and frequency
  - Route status (Active, Inactive, Under Maintenance)
  - Average daily passengers
  - Performance metrics (on-time %, capacity utilization %)

- **Advanced Filtering & Search**
  - Search by route name, code, or description
  - Filter by status (Active, Inactive, Under Maintenance)
  - Pagination support

- **Quick Actions**
  - View route details
  - Edit route configuration
  - Enable/Disable route
  - Delete route

### 2. Interactive Map View
- **Visual Route Representation**
  - All routes displayed on OpenStreetMap
  - Color-coded routes by status or performance
  - Adjustable route opacity based on selection

- **Interactive Controls**
  - Color mode toggle (by status or performance)
  - Show/hide routes layer
  - Show/hide stops layer
  - Click routes to view details

- **Performance-Based Visualization**
  - Green: ≥90% on-time performance
  - Orange: 75-89% on-time performance
  - Red: <75% on-time performance

- **Real-time Bus Positions**
  - Live bus location markers (when available)
  - Animated pulse effect for active buses

### 3. Route Details Panel
Comprehensive information displayed when a route is selected:

- **Route Overview**
  - Complete route information
  - Status and operating parameters
  - Performance metrics with visual indicators

- **Stop-by-Stop Information**
  - Ordered list of all stops
  - Stop name and location coordinates
  - Accessibility indicators
  - Zone type classification
  - Average wait times
  - Passenger boarding/alighting statistics
  - Distance between consecutive stops

### 4. Route Creation/Editing
Interactive route builder with:

- **Basic Information**
  - Route code and name
  - Description
  - Status selection
  - Operating hours (start/end times)
  - Service frequency

- **Route Configuration**
  - Vehicle type selection
  - Estimated travel time
  - Operational cost tracking

- **Interactive Stop Management**
  - Add stops from searchable dropdown
  - Reorder stops with up/down controls
  - Remove stops
  - Automatic route path generation
  - Minimum 2 stops required
  - Auto-calculation of start/end points

## Components

### RouteList
Table view component with filtering, search, and pagination.

**Props:**
- `routes`: Array of bus routes
- `onSelectRoute`: Callback when route is selected
- `onEditRoute`: Callback to edit route
- `onDeleteRoute`: Callback to delete route
- `onToggleStatus`: Callback to enable/disable route
- `onAddRoute`: Callback to add new route
- `selectedRouteId`: Currently selected route ID

### RouteMapView
Interactive map visualization with route overlays.

**Props:**
- `routes`: Array of bus routes to display
- `selectedRoute`: Currently selected route
- `onSelectRoute`: Callback when route is clicked

### RouteDetailsPanel
Detailed information panel for selected route.

**Props:**
- `route`: Selected route object (or null)
- `onClose`: Callback to close the panel

### RouteFormDialog
Modal dialog for creating/editing routes.

**Props:**
- `open`: Dialog visibility state
- `route`: Route to edit (null for new route)
- `allStops`: Available bus stops
- `onClose`: Callback to close dialog
- `onSave`: Callback with route data

## Sample Data

The implementation includes sample routes for Bucharest:
- 7 pre-configured routes
- 10 bus stops across different zones
- Realistic performance metrics
- Operating schedules

## Technologies Used

- **React 19** with TypeScript
- **Material-UI v7** for UI components
- **Leaflet** with react-leaflet for mapping
- **OpenStreetMap** tile layer

## Usage

```tsx
import RouteManagement from '@/pages/manager/RouteManagement';

<RouteManagement
  showNotification={(message, severity) => {
    // Handle notification display
  }}
/>
```

## Future Enhancements

- Real-time bus tracking integration
- Route optimization suggestions
- Schedule/timetable editor
- Historical performance analytics
- Export routes to various formats
- Import routes from external sources
- Advanced traffic pattern analysis
- Integration with AI recommendation engine
