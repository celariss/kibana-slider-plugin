#!/usr/bin/env bash

rm -rf ./build

mkdir -p ./build/kibana/kibana-slider-plugin

rsync -av --progress . ./build/kibana/kibana-slider-plugin \
    --exclude build \
    --exclude build.sh \
    --exclude bower_components \
    --exclude .git \
    --exclude .gitignore \
    --exclude .idea \
    --exclude *.iml

# Retrieve plugin version from the package.json file directly
version=`cat package.json | python -c "import sys, json; print json.load(sys.stdin)['version']"`

cd ./build/
zip -r ./kibana-slider-plugin-$version.zip ./kibana/
cd ..
