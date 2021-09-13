FROM openjdk:11-jre-slim
LABEL org.opencontainers.image.source="https://github.com/iteratec/microzoo"
EXPOSE 8080
RUN apt-get -q update && apt-get -qy install netcat
ADD util/wait-for /wait-for
ADD util/wait-start /wait-start
RUN chmod +x /wait-for && chmod +x /wait-start
ADD target/spring-boot-service-*.jar /app/app.jar
ENTRYPOINT ["./wait-start"]
