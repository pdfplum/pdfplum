#!/usr/bin/env sh

DESTINATION_PATH=./publish-package
EXTENSION_PATH=./pdf-generator

rm -rf $DESTINATION_PATH
mkdir $DESTINATION_PATH

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

  if [[ "$i" == ".firebaserc" ]]
  then
    sed -i 's/--dev//g' "$DESTINATION_PATH/.firebaserc"
  fi
done
