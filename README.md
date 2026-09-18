# Node.js REST API Project

A comprehensive backend REST API application built with Node.js, TypeScript, and MongoDB, designed for managing users and business cards.

## Features
- **User Management:** Registration, user login with JWT authentication, role-based access control, profile updates, and business status management.
- **Card Management:** Create, read, update, and delete business cards, with support for user-specific card views and "likes" functionality.
- **Security & Validation:** Password hashing using `bcryptjs`, and robust request validation using `Joi`.
- **Logging & Middleware:** Error logging using `morgan` and custom file loggers, along with CORS support.

## Technologies Used
- Node.js & Express.js
- TypeScript
- MongoDB & Mongoose
- JSON Web Token (JWT) & bcryptjs
- Joi & Morgan

## API Endpoints Overview
- **Users:** `/users` (POST for registration/login, GET for fetching profiles, PUT/PATCH/DELETE for updates).
- **Cards:** `/cards` (GET for all cards or user cards, POST for creating cards, PUT/PATCH/DELETE for card management).