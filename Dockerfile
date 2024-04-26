FROM node:20-slim

WORKDIR /code
COPY . .

RUN cd server && npm install

EXPOSE 4019

ENTRYPOINT ["./entrypoint.sh"]

