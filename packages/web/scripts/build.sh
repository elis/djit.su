#!/bin/bash

# * Prepare package versions
node scripts/versions.js $@ -v

. ./scripts/load-env.sh $@

echo "3. -> RAZZLE_HASH $RAZZLE_HASH"
razzle build