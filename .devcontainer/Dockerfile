FROM node:18-bullseye

# Install additional tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Playwright dependencies
RUN npx playwright install-deps

# Set working directory
WORKDIR /workspace

# Create non-root user
ARG USERNAME=node
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# Set the default user
USER $USERNAME

# Expose ports
EXPOSE 5173 3001
