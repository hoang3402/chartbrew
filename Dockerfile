FROM node:20-slim

WORKDIR /code
COPY /server .

RUN cd server && npm install

EXPOSE 4019

ENTRYPOINT ["./entrypoint.sh"]

