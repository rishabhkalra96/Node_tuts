#!/bin/bash
 
## Get confirmation 
echo "creating hidden folders data\tokens and data\users"
read -p "The current working dir is ${PWD}. Are you sure (y / n) ?" ans

if [ "${ans,,}" == "y" ]
then
      cd ${PWD}
      mkdir .data
      mkdir .logs
      cd .data
      mkdir users
      mkdir tokens
      mkdir checks
      cd ..
      cd .logs
      mkdir .compressed
fi
