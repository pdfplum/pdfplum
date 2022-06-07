#!/usr/bin/env sh

rm -rf publish-package
mkdir publish-package
DESTINATION=./publish-package

for i in "functions/lib" ".firebaserc" "extension.yaml" "firebase.json" "CHANGELOG.md"
do
  mkdir -p "$DESTINATION/$(dirname $i)"
  cp -r "$i" "$DESTINATION/$i"

  if [[ "$i" == ".firebaserc" ]]
  then
    sed -i 's/--dev//g' "$DESTINATION/.firebaserc"
  fi
done

cd publish-package
