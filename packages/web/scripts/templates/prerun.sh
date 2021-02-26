#!/bin/bash

echo "HEROKU_PORT=$PORT" > .env.local

env="production"

if [ -f .env ]
then
  export $(cat .env | xargs)
  # set -o allexport; source .env; set +o allexport
fi

if [ -f .env.$env ]
then
  export $(cat .env.${env} | xargs)
  # set -o allexport; source .env.$env; set +o allexport
else
  if [ -f .env.development ]
  then
    export $(cat .env.development | xargs)
    # set -o allexport; source .env.development; set +o allexport
  fi
fi

if [ -f .env.local ]
then
  export $(cat .env.local | xargs)
  # set -o allexport; source .env.local; set +o allexport
fi

if [ -f .env.$env.local ]
then
  export $(cat .env.${env}.local | xargs)
  # set -o allexport; source .env.$env.local; set +o allexport
else
  if [ -f .env.development.local ]
  then
    export $(cat .env.development.local | xargs)
    # set -o allexport; source .env.development.local; set +o allexport
  fi
fi
