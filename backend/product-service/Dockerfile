FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
# Copy the entire backend directory (context is ./backend)
COPY . .
# Build the service
RUN mvn clean package -pl product-service -am -DskipTests

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/product-service/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
