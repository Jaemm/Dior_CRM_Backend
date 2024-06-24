FROM node:14-alpine AS development

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install

COPY . .

# Copy SSL/TLS certificates
# COPY /etc/letsencrypt/live/staging.chowis.cloud/ /etc/letsencrypt/live/staging.chowis.cloud/

# COPY /etc/letsencrypt/live/test.chowis.cloud/privkey.pem /etc/letsencrypt/live/test.chowis.cloud/privkey.pem
# COPY /etc/letsencrypt/live/test.chowis.cloud/fullchain.pem /etc/letsencrypt/live/test.chowis.cloud/fullchain.pem
# RUN chmod 755 /etc/letsencrypt/live/test.chowis.cloud/privkey.pem
# RUN chmod 755 /etc/letsencrypt/live/test.chowis.cloud/fullchain.pem

RUN npm run build

EXPOSE 2024
CMD [ "npm", "run", "start:prod" ]

