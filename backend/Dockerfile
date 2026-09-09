# Etapa 1: Compilación con Maven y Java 21
FROM docker.io/library/maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copiar configuración del proyecto y dependencias
COPY pom.xml .
COPY src ./src

# Compilar la aplicación omitiendo tests en el build
RUN mvn clean package -DskipTests

# Etapa 2: Imagen ligera para ejecución en producción
FROM docker.io/library/eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copiar el JAR generado
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
