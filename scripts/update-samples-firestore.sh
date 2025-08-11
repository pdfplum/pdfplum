#!/usr/bin/env bash

set -e
shopt -s globstar

if [[ $PDF_PLUM_UPDATE_SKIP_SAMPLES != "" ]]; then
  exit 0
fi

for i in $(ls template-samples/**/*.json); do
  template="${i%.*}"
  echo "Running Firestore PDF generation for template: $template"
  npm run dev:run:firestore "${template}"
done
