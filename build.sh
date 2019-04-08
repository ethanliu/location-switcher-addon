#!/bin/sh

function usage() {
cat << EOF

NAME
	`basename $0` -- build script

SYNOPSIS
	`basename $0` options

OPTIONS:
	-h	Usage description

EOF
exit 0
}

function buildFirefox() {
	tmp="tmp"

	cp -aR firefox $tmp

	cd $tmp
	version=`cat manifest.json | sed -n "s/.*\"version\": \"\(.*\)\".*/\1/p"`
	echo "Build extension for Firefox"
	echo "Version: ${version}"

	for file in `find . -type f -name "*.js"`; do
		echo "Minify: ${file}"
		/usr/bin/env uglifyjs "${file}" > "${file}.min"
		rm "${file}"
		mv "${file}.min" "${file}"
	done

	zipfile="../dist/location-switcher-firefox-addon-${version}.zip"
	mkdir -p ../dist
	zip -r -FS -q "${zipfile}" * -x "*.DS_Store"

	cd ..
	rm -fr $tmp

	echo "Package: ${zipfile}"
}

function buildChrome() {
	echo "description"
	# exit 1
}

function buildImages() {
	echo "description"
	# exit 1
}

target=${@:$OPTIND:1}

case $target in
	"firefox") buildFirefox;;
	"chrome") buildChrome;;
	"icon") buildImages;;
	*) usage;;
esac
