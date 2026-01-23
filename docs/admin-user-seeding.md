# Admin User Seeding and Persistence Solution

This document explains the problem of vanishing admin data and the solution implemented to ensure persistent admin access across Docker rebuilds.

## The Problem

When the Docker environment was rebuilt (especially with `docker-compose down -v` or by forcing a rebuild), all dynamic data in the database was lost. Since the "admin" user was previously created manually or via external scripts, it disappeared every time the environment was reset. 

Additionally, we found that the `Dockerfile` for the `auth-service` was only copying pre-built JAR files. This meant that any changes to the source code were not being reflected in the running container unless the JAR was manually built outside of Docker first.

## The Solution

### 1. Automatic Admin Seeding

We implemented an automatic seeding mechanism within the `auth-service` using Spring Boot's `CommandLineRunner`. 

- **File**: `backend/auth-service/src/main/java/com/example/auth/config/RoleDataLoader.java`
- **Logic**: 
    - The service now checks for the existence of the roles (`ROLE_USER`, `ROLE_ADMIN`, `ROLE_MANAGER`) upon startup and creates them if they are missing.
    - It then checks if a user with the username `admin` exists.
    - If not, it automatically creates a new admin user:
        - **Username**: `admin`
        - **Email**: `admin@example.com`
        - **Password**: `password123` (hashed using BCrypt)
        - **Role**: `ROLE_ADMIN`

This ensures that as long as the `auth-service` starts up, the admin user will be present in the database, even if the volumes were wiped.

### 2. Multi-Stage Docker Build

To ensure that code changes (like the seeding logic) are actually deployed, we updated the `Dockerfile` for `auth-service` to a **multi-stage build**.

- **File**: `backend/auth-service/Dockerfile`
- **Logic**:
    - **Build Stage**: Uses a Maven image to compile the source code and package the JAR file *inside* the Docker build process.
    - **Run Stage**: Uses a lightweight JRE image to run the generated JAR.
    - **Context Fix**: Updated `docker-compose.yml` to use the `backend` directory as the build context. This allows Maven to access the parent `pom.xml` and any shared modules (like `common`) during compilation.

## How to Verify

To rebuild the environment and verify the persistent admin user:

1. **Rebuild the service**:
   ```bash
   docker-compose up --build -d auth-service
   ```
2. **Login**:
   Use the frontend or `curl` to login with the seeded credentials:
   - **User**: `admin`
   - **Pass**: `password123`

## Future Maintenance

If you need to change the default admin password or add more default users, you can modify the `RoleDataLoader.java` file and then run `docker-compose up --build`.
