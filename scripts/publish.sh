#!/usr/bin/env sh

DESTINATION_PATH=./publish-package
EXTENSION_PATH=./pdf-generator
CHANGELOG_FILE=pdf-generator/CHANGELOG.md
EXTENSION_DOT_YAML_FILE=./pdf-generator/extension.yaml
PACKAGE_DOT_JSON_FILE=./pdf-generator/functions/package.json

rm -rf $DESTINATION_PATH
mkdir $DESTINATION_PATH

VERSION=`head -n 1 $CHANGELOG_FILE | sed "s/^## Version //"`

cd "$EXTENSION_PATH/functions"
npm run build
cd -

for i in "$EXTENSION_PATH/functions/package.json:functions/package.json" "$EXTENSION_PATH/functions/lib:functions/lib" "$EXTENSION_PATH/extension.yaml:extension.yaml" "$EXTENSION_PATH/CHANGELOG.md:CHANGELOG.md" ".firebaserc" "firebase.json"
do
  IFS=":" read -ra ENTRY <<< "$i"
  SOURCE=${ENTRY[0]}
  DESTINATION=${ENTRY[1]:-$SOURCE}
  mkdir -p "$DESTINATION_PATH/$(dirname $DESTINATION)"
  cp -r "$SOURCE" "$DESTINATION_PATH/$DESTINATION"

  if [[ "$DESTINATION" == ".firebaserc" ]]
  then
    sed -i 's/--dev//g' "$DESTINATION_PATH/$DESTINATION"
  fi
  if [[ "$SOURCE" == "$PACKAGE_DOT_JSON_FILE" ]] || [[ "$SOURCE" == "$EXTENSION_DOT_YAML_FILE" ]]
  then
    sed -i "s/<VERSION>/$VERSION/g" "$DESTINATION_PATH/$DESTINATION"
  fi
done

cd $DESTINATION_PATH
firebase ext:dev:publish sassanh/pdf-generator
