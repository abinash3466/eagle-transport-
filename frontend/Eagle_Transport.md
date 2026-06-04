# Eagle Transport React Website + Admin Dashboard Prompt

## Role
Act as a **senior React frontend architect, UI/UX designer, and dashboard designer**. Build a **full React version** of the existing **Eagle Transport** website with a **premium, modern, responsive UI** and an **attractive, professional admin dashboard**.

This output will be used inside **Antigravity**, so generate the project in a way that is:
- clean
- modular
- production-style
- beginner-readable
- easy to extend later

Do **not** remove any existing business features. Convert the current website into a full React version while preserving all current logic, sections, and workflows.

---

## Core Goal
Create a **complete React frontend** for **Eagle Transport** that includes:
1. Public transport booking website
2. Secure truck tracking page
3. Driver app interface
4. Owner/admin dashboard
5. Attractive layout and dashboard design
6. Responsive mobile + tablet + desktop UI
7. Premium business presentation

---

## Brand Details
- **Brand Name:** Eagle Transport
- **Tagline:** Safe. Fast. Trusted.
- **Industry:** Truck booking / logistics / goods transport
- **Tone:** professional, premium, trustworthy, clear, modern
- **Primary Colors:**
  - blue: `#0f4a88`
  - dark blue: `#0b315d`
  - orange accent: `#ff8a1d`
  - soft background: `#f5f8fc`
- **Typography:** Montserrat or similar premium modern font

---

## Technical Stack Requirements
Build the frontend in:
- **React**
- **Vite**
- **React Router DOM**
- **Axios** for API calls
- **Leaflet or React Leaflet** for live tracking map
- modular component structure
- reusable cards, buttons, forms, layout blocks

Use:
- functional components
- hooks
- clean folder structure
- readable variable names
- simple but professional code

---

## Required App Structure
Create a full React project structure like this:

```txt
src/
  assets/
  components/
    Navbar.jsx
    Footer.jsx
    HeroSection.jsx
    BookingForm.jsx
    StatsSection.jsx
    TruckCard.jsx
    WhyChooseSection.jsx
    PartnerSection.jsx
    ContactSection.jsx
    TrackingSearchCard.jsx
    TrackingSummaryCard.jsx
    TrackingTimeline.jsx
    LiveMapCard.jsx
    DashboardSidebar.jsx
    DashboardTopbar.jsx
    SummaryCard.jsx
    DataTable.jsx
    StatusBadge.jsx
  pages/
    Home.jsx
    Trucks.jsx
    Tracking.jsx
    OwnerLogin.jsx
    DriverLogin.jsx
    OwnerDashboard.jsx
    DriverApp.jsx
    NotFound.jsx
  api/
    bookingApi.js
    trackingApi.js
    dashboardApi.js
    truckApi.js
  styles/
    global.css
    home.css
    tracking.css
    dashboard.css
  App.jsx
  main.jsx
```

---

## Routing Requirements
Use React Router and create routes for:
- `/` → Home page
- `/trucks` → Truck types page
- `/tracking` → Tracking search page
- `/tracking/:bookingId` → Live tracking result page
- `/owner/login` → Owner login
- `/driver/login` → Driver login
- `/owner/dashboard` → Owner dashboard
- `/driver/app` → Driver app
- `*` → Not Found page

---

## Public Website Requirements

### 1. Home Page
Create a premium hero section with:
- Eagle Transport badge
- large heading
- short description
- CTA buttons:
  - Book Truck Now
  - View Truck Types
  - Track Truck
- hero background image / transport background
- booking form on the right side for desktop
- booking form below for mobile
- clean spacing and modern shadows

### Hero content text
Use this content:
- **Heading:** Eagle Transport Service: Fast & Easy Truck Booking Across India.
- **Description:** Simple booking process. Clear truck options. Reliable service for District, State, and National loads.

### Booking Form fields
Include:
- customer_name
- mobile
- pickup_location
- drop_location
- trip_level
- truck_type
- goods_type
- load_weight
- estimated price box
- Check Truck Fare button
- Confirm Booking button

Also show a small note:
- After booking, customer receives a Booking ID and Tracking OTP for secure tracking.

### Stats section
Show 4 stats cards:
- 8 Total Trucks
- 24/7 Booking Support
- 3 Trip Levels
- 100% Easy Booking

### Recent Bookings section
Show cards with:
- customer name
- booking ID
- trip
- route
- truck
- goods
- estimated amount
- status

### Truck Types section
Truck cards should include:
- icon
- truck name
- capacity
- best use case
- Select This Truck button

Truck types:
- Mini Truck
- Pickup
- Light Commercial
- Heavy Truck
- Trailer
- Container Truck

### Why Choose Eagle Transport section
Cards:
- Quick & Easy Booking
- Local to All-India Routes
- Instant WhatsApp Support
- Real-Time Trip Tracking

### Partners section
Partner brand showcase cards:
- Tata Motors
- Ashok Leyland
- Mahindra
- BharatBenz
- Eicher
- Volvo

### Contact section
Show:
- Call Now button
- WhatsApp button
- Track Your Booking button

---

## Tracking System Requirements
Build an attractive dedicated tracking experience.

### Tracking Search Page
Create a premium tracking page with:
- heading
- short description
- booking ID input
- tracking OTP input
- Track Now button

### Tracking Result Page
Show:
- booking summary card
- current tracking status banner
- customer name
- booking ID
- route
- truck type
- goods type
- estimated amount
- assigned driver name
- assigned driver mobile
- current location
- last updated time
- live map
- live timeline

### Timeline events examples
- Booking Received
- Truck Assigned
- Live Location Updated
- On The Way
- Delivered Successfully
- Booking Cancelled

### Live Map Requirements
Use Leaflet or React Leaflet.
Show:
- marker
- auto refresh every 20 seconds
- fallback location if coordinates missing
- current location text
- last updated text

### Tracking UX
Make it secure and premium:
- Booking ID + OTP verification UI
- success / error messages
- live status banner
- timeline panel
- map panel

---

## Driver App Requirements
Create a separate React page for driver operations.

### Driver App sections
1. Driver summary card
2. GPS current location button
3. Tyre management form
4. Fuel entry form
5. Toll entry form
6. Truck health status form
7. Recent tyre logs
8. Recent fuel logs
9. Recent toll entries
10. Active assigned bookings section for tracking

### Driver summary card data
- driver name
- assigned truck name
- truck number
- current location
- diesel percent
- engine oil percent
- battery voltage

### GPS section
Include:
- Use Current GPS button
- live status text
- current location display

### Driver tracking update section
Create a dedicated card where driver can update:
- booking selection dropdown
- tracking status dropdown
- live location note
- update button

Statuses:
- Truck Assigned
- On The Way
- Reached Pickup
- In Transit
- Delivered Successfully

---

## Owner/Admin Dashboard Requirements
Create a **very attractive premium admin dashboard**.
This should feel like a real logistics management dashboard.

### Layout
- fixed sidebar or elegant dashboard navigation
- top bar with title / quick actions / summary
- responsive cards and data tables
- premium shadows and panel layout

### Dashboard summary cards
Show:
- Total Trucks
- Active Trucks
- Live Bookings
- Pending Tolls
- Alerts Count
- Total Toll Amount

### Main dashboard sections

#### 1. Truck Health Overview
Table columns:
- Truck
- Category
- Driver
- Location
- Diesel
- Engine
- Battery
- Tyre
- Score
- Status

#### 2. Live Booking Tracking
Table columns:
- Customer
- Mobile
- Booking ID
- Route
- Truck
- Amount
- Status

Also provide owner update form with:
- select booking
- status dropdown
- assign truck dropdown
- assign driver dropdown
- update button

#### 3. Emergency Alerts
Alert cards or list:
- truck name
- alert type
- message
- created time
- resolve button

#### 4. Tollgate Details
Table columns:
- Truck
- Driver
- Route
- Tollgate
- Crossed Time
- Amount
- Method
- Status
- Notes

#### 5. Add New Truck form
Fields:
- truck name
- truck number
- category
- capacity
- driver name
- current location

#### 6. Add New Driver form
Fields:
- full name
- username
- password
- mobile
- assign truck

#### 7. Update Toll Payment form
Fields:
- select toll entry
- amount paid
- payment method
- payment status

### Dashboard style expectations
- dark blue + white premium balance
- subtle gradients
- data-rich but clean
- responsive cards
- tables with badges
- status pills with colors
- smooth hover effects
- polished admin feel

---

## Booking + Tracking Logic Requirements
Design the React UI to support these backend concepts:

### Booking fields
- booking_id
- tracking_otp
- tracking_status
- assigned_driver_id
- assigned_truck_id
- current_location
- current_latitude
- current_longitude
- last_location_update
- whatsapp_updates_enabled

### Booking flow
1. Customer fills booking form
2. Estimated amount shown
3. Booking submitted
4. Success message displayed
5. Booking ID + Tracking OTP shown
6. Customer can visit Tracking page

### Tracking flow
1. Enter Booking ID
2. Enter OTP
3. Verify securely
4. Show booking summary + live status + map + timeline

### Owner flow
1. Owner updates booking status
2. Assigns truck and driver
3. Tracking status updates in UI

### Driver flow
1. Driver updates live location
2. Booking tracking page refreshes automatically
3. Timeline updates visually

---

## API Integration Requirements
Create API service files using Axios.
Use clear functions like:

### bookingApi.js
- createBooking
- getRecentBookings
- calculateEstimate

### trackingApi.js
- verifyTracking
- getTrackingDetails
- refreshTracking

### dashboardApi.js
- getDashboardSummary
- getBookings
- updateBookingStatus
- getAlerts
- resolveAlert
- getTollLogs

### truckApi.js
- getTrucks
- addTruck
- addDriver

Use a centralized API base URL and clean async code.

---

## UI / UX Style Rules
Make the website look:
- premium
- corporate
- trustworthy
- logistics-focused
- modern
- smooth
- highly readable

### Design rules
- rounded cards
- soft shadows
- consistent spacing
- strong hierarchy
- clear CTA buttons
- gradient banners where useful
- modern status badges
- polished forms
- rich dashboard visuals
- responsive layouts

### Animations
Use tasteful micro animations only:
- button hover
- card hover
- smooth section reveal
- dashboard panel transitions
- no over-animation

---

## Responsiveness Rules
Build fully responsive layouts:
- Desktop: full dashboard grid and hero split layout
- Tablet: stacked clean cards
- Mobile: single-column layout, readable forms, collapsible nav

Do not break mobile view.

---

## Code Quality Rules
Generate code that is:
- beginner-readable
- modular
- properly named
- commented where helpful
- easy to maintain
- not messy
- not over-complicated

Avoid:
- unnecessary abstraction
- random complexity
- confusing file naming
- duplicate code

---

## Deliverables Expected From Antigravity
Generate:
1. full React app structure
2. all page components
3. reusable components
4. routing setup
5. CSS / styling files
6. dashboard UI
7. tracking page UI
8. booking form UI
9. API integration placeholders
10. premium admin dashboard look

---

## Final Instruction
Build the **full Eagle Transport React website and attractive admin dashboard** using all the requirements above.
Preserve all existing business logic and sections, but convert the experience into a **modern React application** with a **premium logistics brand feel**.

The final result should look like a real transport company product, not a basic student demo.
