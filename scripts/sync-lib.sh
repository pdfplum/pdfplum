#!/usr/bin/env bash

set -e

for EXTENSION in "firestore-pdf-generator" "http-pdf-generator"
do
  rsync -av --delete common-stuff/lib/ $EXTENSION/functions/lib
done
