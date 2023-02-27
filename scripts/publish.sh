#!/usr/bin/env bash

set -e

for EXTENSION in "firestore-pdf-generator" "http-pdf-generator"
do
  DESTINATION_PATH="./publish-package"
  EXTENSION_PATH="./$EXTENSION"
  CHANGELOG_FILE=CHANGELOG.md
  EXTENSION_DOT_YAML_FILE="$EXTENSION_PATH/extension.yaml"
  PACKAGE_DOT_JSON_FILE="$EXTENSION_PATH/functions/package.json"

  rm -rf $DESTINATION_PATH
  mkdir $DESTINATION_PATH

  VERSION=`grep -P "## Version.*<!--subject:$EXTENSION-->" "$CHANGELOG_FILE" | head -n 1 | sed -E "s/^## Version ([[:digit:]]+\.[[:digit:]]+\.[[:digit:]]+).*/\1/"`
  EXTENSION_VERSION=`grep -P "^version: \d+\.\d+\.\d+\$" $EXTENSION_DOT_YAML_FILE | sed "s/^version: //"`
  PACKAGE_DOT_JSON_VERSION=`grep -P "^\s*\"version\": \"\d+\.\d+\.\d+\",?\$" $PACKAGE_DOT_JSON_FILE | sed "s/^[[:space:]]*\"version\": \"\([^\"]*\)\",\{0,1\}$/\1/"`

  if [[ "$VERSION" != "$EXTENSION_VERSION" ]]
  then
    echo "Version in 'CHANGELOG.md' ($VERSION) does not match with the version in 'extensions.yaml' ($EXTENSION_VERSION)"
    exit 1
  fi

  if [[ "$VERSION" != "$PACKAGE_DOT_JSON_VERSION" ]]
  then
    echo "Version in 'CHANGELOG.md' ($VERSION) does not match with the version in '$EXTENSION_PATH/functions/package.json' ($PACKAGE_DOT_JSON_VERSION)"
    exit 1
  fi

  if [[ -z "$PUBLISHER_ID" ]]
  then
    echo "'PUBLISHER_ID' environment variable is needed"
    exit 1
  fi

  cd "$EXTENSION_PATH/functions"
  npm run clean
  npm run build
  cd -

  cat $CHANGELOG_FILE | tr '\n' '\r' | perl -ne "s/## (?!Version \d+\.\d+\.\d+[^\r]*<!--subject:$EXTENSION-->)(.(?!##))*\r//g; print;" | tr '\r' '\n' > "$DESTINATION_PATH/CHANGELOG.md"

  for i in "$EXTENSION_PATH/functions/package.json:functions/package.json" "$EXTENSION_PATH/functions/build:functions/build" "$EXTENSION_PATH/extension.yaml:extension.yaml" "$EXTENSION_PATH/POSTINSTALL.md:POSTINSTALL.md" "$EXTENSION_PATH/PREINSTALL.md:PREINSTALL.md" "firebase.json"
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
