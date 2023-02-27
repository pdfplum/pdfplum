#!/usr/bin/env bash

set -e
shopt -s globstar

for i in $(ls template-samples/**/*.json)
do
  template="${i%.*}"
  echo $template
  npm run dev:run "${template}"
done
