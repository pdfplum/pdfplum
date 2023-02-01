#!/usr/bin/env sh

for i in $(ls template-samples/**.json)
do
  template="${i%.*}"
  npm run dev:run "${template}"
done
