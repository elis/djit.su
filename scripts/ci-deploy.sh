#!/bin/bash


# * Cleanup and create deploy directory
rm -rf ./deploy
mkdir deploy

./scripts/build.sh local -p ./deploy

node scripts/versions.js production -l false

# * Copy built resources
cp -R build deploy/build

# * Create prerun from template
cp scripts/templates/prerun.sh deploy/prerun.sh

# * Create Procfile
echo "web: npm run start:prod-mon" > deploy/Procfile
