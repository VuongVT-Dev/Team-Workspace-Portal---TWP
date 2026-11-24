# Stage 1: Build Spring Boot JAR with Maven & Java 21 (using Google GCS Asia mirror to avoid Maven Central 429)
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml settings.xml ./
COPY src ./src
RUN mvn -s settings.xml clean package -DskipTests -B -Dmaven.artifact.threads=3

# Stage 2: Lightweight Java 21 runtime tuned for Render Free (512MB RAM)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Xmx384m", "-jar", "app.jar"]
