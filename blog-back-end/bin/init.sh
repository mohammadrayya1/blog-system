#!/bin/bash
set -e
symfony console doctrine:database:drop --force --if-exists
symfony console doctrine:database:create --if-not-exists
symfony console doctrine:migrations:migrate --no-interaction
symfony console doctrine:schema:drop --force --no-interaction
symfony console doctrine:schema:create --no-interaction
symfony console doctrine:fixtures:load --no-interaction

echo "✅ You have new database"
