# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Cache Maven dependencies first
COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn package -DskipTests -B

# ─── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=build /app/target/ats-resume-checker-1.0.0.jar app.jar

EXPOSE 8080

# JVM tuning for Render free tier (512MB RAM):
# -Xmx256m      → max heap 256MB
# -Xms64m       → start heap small
# -XX:+UseSerialGC → lower GC overhead than G1GC
# -XX:MaxMetaspaceSize=128m → cap metaspace
ENTRYPOINT ["java", \
  "-Xmx256m", "-Xms64m", \
  "-XX:+UseSerialGC", \
  "-XX:MaxMetaspaceSize=128m", \
  "-Dspring.profiles.active=prod", \
  "-jar", "app.jar"]
