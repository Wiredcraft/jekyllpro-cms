#!/usr/bin/env bash

echo $APPLICATION_USER
echo $APPLICATION_PASSWORD

echo "Creating mongo user for a specific db..."
mongo admin --host localhost -u $MONGO_INITDB_ROOT_USERNAME -p $MONGO_INITDB_ROOT_PASSWORD
mongo $APPLICATION_DB --eval "db.createUser({user: '$APPLICATION_USER', pwd: '$APPLICATION_PASSWORD', roles: [{role: 'readWrite', db: '$APPLICATION_DB'}]});"
echo "Mongo user created."
