#!/bin/bash

# param: --rebuild

REBUILD=false
if [ "$1" == "--rebuild" ]; then
    REBUILD=true
fi

echo "Deploying to dev environment 🚀"

if [ "$REBUILD" == true ]; then
    echo "Rebuilding docker image..."
    gcloud compute ssh \
        --zone "asia-southeast1-b" \
        "instance-20241012-145325" \
        --project "cwgame-app" \
        --command "cd data/cwgame-be && git pull && docker-compose down && docker rm -f cwgame_postgres && docker-compose up --build -d"
else
    echo "Deploying docker image..."
    gcloud compute ssh \
        --zone "asia-southeast1-b" \
        "instance-20241012-145325" \
        --project "cwgame-app" \
        --command "cd data/cwgame-be && git pull && docker-compose up --build -d"
fi

echo "Deployed to dev environment 🎉"
