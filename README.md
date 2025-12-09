# Vehicle Rental System

This is a complete vehicle Rental Management system with fully functional and secure.

## Main Features I add

- **User Authentication & Authorization**: JWT-based authentication with role-based access control (Admin/Customer)
- **User Management**: Create, read, update, and delete user profiles
- **Vehicle Management**: Full CRUD operations for vehicle inventory
- **Booking System**: Create and manage vehicle bookings with automatic status updates


## Tech Stack I use to build this app

- **Runtime**: Node.js
- **Framework**: Express.js v5
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: bcryptjs
- **Development**: tsx (TypeScript execution)



## If you want to run my code on your system, then follow my instructions

### Prerequisites

- Node.js 
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Newajdev/Vehicle_Rental_System-Assignment02-.git
cd Vehicle_Rental_System-Assignment02
```

2. Install dependencies:
```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
CONNECTION_STR=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
```


### Running the Application

```bash
npm run dev
```

The server will start on `http://localhost:5000`
