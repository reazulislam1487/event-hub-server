# Event Hub - Server Side

This repository contains the backend API for **Event Hub**, an event management platform where users can browse, create, join, and manage events.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Project Overview

Event Hub backend is built with Node.js, Express, and MongoDB. It provides RESTful APIs for user authentication, event management, and user-event interactions.

The API supports features such as user registration/login, event creation and updates, searching/filtering events, and joining events with attendance tracking.

---

## Features

- User registration with validation and secure password hashing
- User login with JWT-based authentication
- Create, read, update, and delete (CRUD) events
- Search and filter events by title, date ranges (today, this week, last week, this month, last month)
- Join events, with logic to prevent multiple joins by the same user
- User profile fetching and updating
- Input validation and comprehensive error handling
- CORS support for frontend integration

---

## Tech Stack

- **Node.js** — JavaScript runtime environment
- **Express.js** — Web framework for Node.js
- **MongoDB** — NoSQL database
- **jsonwebtoken** — For JWT authentication
- **bcryptjs** — For password hashing
- **cors** — Cross-Origin Resource Sharing middleware
- **dotenv** — To manage environment variables
- **nodemon** (dev dependency) — For live-reloading during development

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/download/) (v16 or later recommended)
- [MongoDB](https://www.mongodb.com/) instance (local or cloud like MongoDB Atlas)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/event-hub-server.git
   cd event-hub-server
   ```

### Install dependencies:

```bash
npm install
```
