FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
ENV NODE_ENV=production
# Override default port to avoid conflicts
ENV PORT=5002
EXPOSE 5002
CMD ["node", "index.js"]
