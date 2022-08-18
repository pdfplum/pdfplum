#!/usr/bin/env sh

DESTINATION_PATH=./publish-package
EXTENSION_PATH=./pdf-generator
CHANGELOG_FILE=pdf-generator/CHANGELOG.md
EXTENSION_DOT_YAML_FILE=./pdf-generator/extension.yaml
PACKAGE_DOT_JSON_FILE=./pdf-generator/functions/package.json

rm -rf $DESTINATION_PATH
mkdir $DESTINATION_PATH

VERSION=`head -n 1 $CHANGELOG_FILE | sed "s/^## Version //"`
EXTENSION_VERSION=`grep "^version: \d\+\.\d\+\.\d\+\$" $EXTENSION_DOT_YAML_FILE | sed "s/^version: //"`
PACKAGE_VERSION=`grep "^\s*\"version\": \"\d\+\.\d\+\.\d\+\",\?\$" $PACKAGE_DOT_JSON_FILE | sed "s/^\s*\"version\": \"\([^\"]*\)\",\?/\1/"`

if [[ "$VERSION" != "$EXTENSION_VERSION" ]]
then
  echo "Version in 'CHANGELOG.md' ($VERSION) does not match with the version in 'extensions.yaml' ($EXTENSION_VERSION)"
  exit 1
fi

if [[ "$VERSION" != "$PACKAGE_VERSION" ]]
then
  echo "Version in 'CHANGELOG.md' ($VERSION) does not match with the version in 'package.json' ($PACKAGE_VERSION)"
  exit 1
fi

cd "$EXTENSION_PATH/functions"
npm run build
cd -

for i in "$EXTENSION_PATH/functions/package.json:functions/package.json" "$EXTENSION_PATH/functions/lib:functions/lib" "$EXTENSION_PATH/extension.yaml:extension.yaml" "$EXTENSION_PATH/CHANGELOG.md:CHANGELOG.md" "firebase.json"
do
  IFS=":" read -ra ENTRY <<< "$i"
  SOURCE=${ENTRY[0]}
  DESTINATION=${ENTRY[1]:-$SOURCE}
  mkdir -p "$DESTINATION_PATH/$(dirname $DESTINATION)"
  cp -r "$SOURCE" "$DESTINATION_PATH/$DESTINATION"

  if [[ "$SOURCE" == "$PACKAGE_DOT_JSON_FILE" ]]
  then
    sed -i "s/<VERSION>/$VERSION/g" "$DESTINATION_PATH/$DESTINATION"
  fi
done

cd $DESTINATION_PATH
firebase ext:dev:publish $PUBLISHER_ID/pdf-generator
