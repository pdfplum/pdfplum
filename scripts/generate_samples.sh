#!/usr/bin/env sh

for i in $(ls template-samples/*.json)
do
  filename=$(basename -- $i)
  template="${filename%.*}"
  npm run dev:run "template-samples/${template}"
done
