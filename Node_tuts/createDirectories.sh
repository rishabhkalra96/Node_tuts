#!/bin/bash
 
## Get confirmation 
echo "creating hidden folders data\tokens and data\users"
read -p "The current working dir is ${PWD}. Are you sure (y / n) ?" ans

if [ "${ans,,}" == "y" ]
then
      cd ${PWD}
      mkdir .data
      cd .data
      mkdir users
      mkdir tokens
      mkdir checks
fi
