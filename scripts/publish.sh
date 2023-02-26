#!/usr/bin/env bash

set -e

for EXTENSION in "firestore-pdf-generator" "http-pdf-generator"
do
  DESTINATION_PATH="./publish-package"
  EXTENSION_PATH="./$EXTENSION"
  CHANGELOG_FILE=CHANGELOG.md
  EXTENSION_DOT_YAML_FILE="$EXTENSION_PATH/extension.yaml"
  PACKAGE_DOT_JSON_FILE="$EXTENSION_PATH/functions/package.json"
  ROOT_PACKAGE_DOT_JSON_FILE=./package.json

  rm -rf $DESTINATION_PATH
  mkdir $DESTINATION_PATH

  VERSION=`grep -E "## Version" "$CHANGELOG_FILE" | head -n 1 | sed "s/^## Version //"`
  EXTENSION_VERSION=`grep -E "^version: \d+\.\d+\.\d+\$" $EXTENSION_DOT_YAML_FILE | sed "s/^version: //"`
  PACKAGE_VERSION=`grep -E "^\s*\"version\": \"\d+\.\d+\.\d+\",?\$" $PACKAGE_DOT_JSON_FILE | sed "s/^[[:space:]]*\"version\": \"\([^\"]*\)\",\{0,1\}$/\1/"`
  ROOT_PACKAGE_VERSION=`grep -E "^\s*\"version\": \"\d+\.\d+\.\d+\",?\$" $ROOT_PACKAGE_DOT_JSON_FILE | sed "s/^[[:space:]]*\"version\": \"\([^\"]*\)\",\{0,1\}$/\1/"`

  if [[ "$VERSION" != "$EXTENSION_VERSION" ]]
  then
    echo "Version in 'CHANGELOG.md' ($VERSION) does not match with the version in 'extensions.yaml' ($EXTENSION_VERSION)"
    exit 1
  fi

  if [[ "$VERSION" != "$PACKAGE_VERSION" ]]
  then
    echo "Version in 'CHANGELOG.md' ($VERSION) does not match with the version in '$EXTENSION_PATH/functions/package.json' ($PACKAGE_VERSION)"
    exit 1
  fi

  if [[ "$VERSION" != "$ROOT_PACKAGE_VERSION" ]]
  then
    echo "Version in 'CHANGELOG.md' ($VERSION) does not match with the version in '/package.json' ($ROOT_PACKAGE_VERSION)"
    exit 1
  fi

  if [[ -z "$PUBLISHER_ID" ]]
  then
    echo "'PUBLISHER_ID' environment variable is needed"
    exit 1
  fi

  cd "$EXTENSION_PATH/functions"
  npm run build
  cd -

  for i in "$EXTENSION_PATH/functions/package.json:functions/package.json" "$EXTENSION_PATH/functions/lib:functions/lib" "$EXTENSION_PATH/extension.yaml:extension.yaml" "$EXTENSION_PATH/POSTINSTALL.md:POSTINSTALL.md" "$EXTENSION_PATH/PREINSTALL.md:PREINSTALL.md" "CHANGELOG.md:CHANGELOG.md" "firebase.json"
  do
    IFS=":" read -ra ENTRY <<< "$i"
    SOURCE=${ENTRY[0]}
    DESTINATION=${ENTRY[1]:-$SOURCE}
    mkdir -p "$DESTINATION_PATH/$(dirname $DESTINATION)"
    cp -rL "$SOURCE" "$DESTINATION_PATH/$DESTINATION"
  done

  cd $DESTINATION_PATH
  firebase ext:dev:publish $PUBLISHER_ID/$EXTENSION
  cd -
done
