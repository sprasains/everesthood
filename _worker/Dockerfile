# Worker Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY ../package.json ../package-lock.json ./
RUN npm install --ignore-scripts && npm install ts-node typescript --save
COPY ./worker ./worker
CMD ["npx", "ts-node", "worker/index.ts"] 