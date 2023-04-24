# Use an official nodejs runtime
FROM node:18

# Add user that will be used in the container.
RUN useradd arjun

# Port used by this container to serve HTTP.
EXPOSE 3000

# Install system packages required by puppeter.
RUN apt-get update && apt install -y \
    gconf-service libgbm-dev \
    libasound2 libatk1.0-0 \
    libc6 libcairo2 libcups2\
    libdbus-1-3 libexpat1 libfontconfig1\
    libgcc1 libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 libgtk-3-0 \
    libnspr4 libpango-1.0-0 \
    libpangocairo-1.0-0 libstdc++6 libx11-6\
    libx11-xcb1 libxcb1 libxcomposite1\
    libxcursor1 libxdamage1 libxext6 libxfixes3\
    libxi6 libxrandr2 libxrender1 \
    libxss1 libxtst6 ca-certificates fonts-liberation\
    libappindicator1 libnss3 lsb-release xdg-utils wget

WORKDIR /app

COPY package*.json ./

RUN npm i

RUN npm run build

RUN chown arjun:arjun /app

# Copy the source code of the project into the container.
COPY --chown=arjun:arjun . .

# Use user "arjun" to run the build commands below and the server itself.
USER arjun

CMD npm start