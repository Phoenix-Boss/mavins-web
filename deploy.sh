#!/bin/bash
# deploy.sh

echo "ðŸš€ Deploying SoundWave to Production..."

# Load environment variables
source .env.production

# Build the application
echo "ðŸ“¦ Building application..."
npm run build

# Run database migrations
echo "ðŸ—„ï¸ Running database migrations..."
npx supabase migration up

# Deploy to server
echo "ðŸ“¤ Deploying to server..."
rsync -avz --delete .next/ user@server:/var/www/soundwave/.next/
rsync -avz --delete public/ user@server:/var/www/soundwave/public/
rsync -avz package.json user@server:/var/www/soundwave/

# Restart PM2 process
echo "ðŸ”„ Restarting PM2 process..."
ssh user@server "pm2 restart soundwave"

echo "âœ… Deployment complete!"
