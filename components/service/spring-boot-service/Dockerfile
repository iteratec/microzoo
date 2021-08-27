FROM openjdk:11-jre-slim
EXPOSE 8080
ARG JAR_FILE=target/demo-app-1.0.0.jar
ADD target/spring-boot-service-*.jar /app/app.jar
ENTRYPOINT ["java","-jar","/app/app.jar"]
