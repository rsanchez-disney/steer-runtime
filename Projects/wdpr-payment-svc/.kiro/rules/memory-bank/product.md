# Payment Service - Product Overview

## Purpose
The Payment Service is a dockerized REST-based microservice that handles payment processing operations for Walt Disney Parks and Resorts Online (WDPRO). It serves as the central payment gateway integrating with multiple payment providers including First Data, DVIC (Disney Visa Integrated Card), and various gift card systems.

## Key Features

### Payment Processing
- Credit card payment processing and authorization
- Gift card balance inquiries and transactions
- Disney Visa card integration and management
- Payment plan management and processing
- Zero-dollar authorization support
- Multi-payment method support (credit cards, gift cards, reward cards)

### Account Management
- Guest account payment profile management
- Credit card registration and updates
- Gift card account management
- Reload rule creation and management for stored value cards
- Payment method storage and retrieval

### Integration Capabilities
- First Data payment gateway integration (SVdot protocol)
- DVIC (Disney Visa Integrated Card) integration
- Accertify fraud detection integration
- Dossier user profile integration
- OAuth 2.0 and JWT token authentication
- SAML-based authentication for DVIC

### Security Features
- PCI-compliant payment data handling
- Encryption for sensitive payment information (Jasypt)
- Vault integration for secrets management
- JWT token validation and authorization
- OAuth protection profiles
- Log masking for sensitive data (PAN, CVV, etc.)

### Operational Features
- Health check endpoints for monitoring
- Metrics collection (Dropwizard Metrics)
- Comprehensive error handling and mapping
- Transaction logging and audit trails
- Quartz-based scheduled job processing
- Database transaction management (JPA/Hibernate)

## Target Users

### Internal Consumers
- E-commerce applications (dining, tickets, merchandise)
- Mobile applications (My Disney Experience)
- Point-of-sale systems
- Guest services applications
- Reservation systems

### Use Cases
- Online ticket purchases
- Dining reservations with payment
- Merchandise transactions
- Gift card purchases and reloads
- Payment plan enrollments
- Balance inquiries
- Payment method management for guest profiles
- Fraud detection and prevention
- Payment authorization and settlement

## Value Proposition
Provides a centralized, secure, and scalable payment processing platform that abstracts the complexity of multiple payment providers while ensuring PCI compliance and seamless integration with Disney's ecosystem of guest-facing applications.
