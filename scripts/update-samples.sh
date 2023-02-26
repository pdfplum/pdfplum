#!/usr/bin/env bash

shopt -s globstar

for i in $(ls template-samples/**/*.json)
do
  template="${i%.*}"
  echo $template
  npm run dev:run "${template}"
done
