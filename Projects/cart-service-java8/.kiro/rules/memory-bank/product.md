# Cart Service - Product Overview

## Purpose
Cart Service is a RESTful web service that provides shopping cart functionality for Disney's e-commerce platform. It enables guests to select products, review selections, make modifications or additions, and prepare items for purchase across multiple Disney product categories including tickets, dining, resorts, packages, and more.

## Key Features

### Core Shopping Cart Operations
- Create and manage shopping carts with unique cart IDs
- Add, update, and remove items from carts
- Support for multiple product types: tickets, dining reservations, resort packages, annual passes, personal magic items, insurance, vouchers, and bundles
- Cart state management (active, on-hold, ready-to-modify)
- Cart validation and error handling
- Participant management for cart items

### Product Integration
- Integration with Product Service for product details and pricing
- Integration with Availability Service for inventory checks
- Integration with Profile Service for guest information
- Integration with Facility Service for resort and venue details
- Support for Disney Package Service and Disney Offer Service

### Advanced Capabilities
- Composite item handling (packages with multiple components: rooms, tickets, dining)
- Party mix management for resort packages
- Pricing calculations including taxes, fees, and discounts
- Marketing offer application and validation
- Discount code processing
- Currency conversion support
- Epic link support for package relationships

### Persistence and Caching
- JPA-based persistence with MariaDB/MySQL database
- Redis caching for performance optimization
- Support for both Oracle and MySQL databases (migration to MariaDB)

### Messaging and Events
- RabbitMQ integration for cart event publishing
- Asynchronous event processing for cart modifications
- Queue-based communication with downstream systems

### Monitoring and Metrics
- AWS CloudWatch metrics publishing
- Hystrix circuit breaker integration
- Health check endpoints
- Performance monitoring and logging

## Target Users

### Primary Users
- **Disney Guests**: End users shopping for Disney products through web and mobile applications
- **Travel Agents**: Professional agents booking Disney vacations for clients
- **Call Center Representatives**: Disney cast members assisting guests with bookings

### Integration Consumers
- **Checkout Service**: Consumes cart data for payment processing
- **Reservation Systems**: Downstream systems that process confirmed bookings
- **Analytics Platforms**: Systems tracking shopping behavior and cart metrics
- **Mobile Applications**: iOS and Android apps for Disney parks and resorts
- **Web Applications**: Disney vacation planning websites

## Use Cases

### Guest Shopping Journey
1. Guest browses Disney products and adds items to cart
2. Cart service validates availability and pricing
3. Guest modifies quantities, dates, or participants
4. Cart service recalculates pricing and applies offers
5. Guest proceeds to checkout with validated cart

### Package Booking
1. Guest selects a resort package (room + tickets + dining)
2. Cart service creates composite item with all components
3. Guest customizes party mix and component selections
4. Cart service validates component compatibility
5. Cart maintains package integrity through modifications

### Saved Cart Management
1. Guest creates cart but doesn't complete purchase
2. Cart service persists cart data with expiration
3. Guest returns later to retrieve saved cart
4. Cart service revalidates availability and pricing
5. Guest completes or modifies saved cart

### Agent-Assisted Booking
1. Travel agent creates cart on behalf of guest
2. Cart service supports agent-specific workflows
3. Agent applies special offers and discounts
4. Cart service validates agent permissions
5. Agent completes booking with proper attribution

### Cart Conversion and Migration
1. Offline cart created through call center
2. Cart service supports conversion to online cart
3. Validation ensures data integrity during conversion
4. Cart service maintains audit trail
5. Converted cart available for online completion
