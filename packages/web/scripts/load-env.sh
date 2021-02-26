
# echo "LOADING ENV $1 $PWD"
env="development"
if [ $1 ]
then
  env=$1
fi
echo "LOADING ENV $env $PWD"


if [ -f .env ]
then
  set -o allexport; source .env; set +o allexport
fi

if [ -f .env.$env ]
then
  set -o allexport; source .env.$env; set +o allexport
else
  if [ -f .env.development ]
  then
    set -o allexport; source .env.development; set +o allexport
  fi
fi

if [ -f .env.local ]
then
  set -o allexport; source .env.local; set +o allexport
fi

if [ -f .env.$env.local ]
then
  set -o allexport; source .env.$env.local; set +o allexport
else
  if [ -f .env.development.local ]
  then
    set -o allexport; source .env.development.local; set +o allexport
  fi
fi
