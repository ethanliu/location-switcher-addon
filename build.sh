#!/bin/sh

function usage() {
cat << EOF

Usage: `basename $0` <target>

Targets:

	firefox		Build Firefox extension
	chrome		Build Chrome extension
	icon		Build images for Chrome extension

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

	for file in `find . -type f -name "*.css"`; do
		echo "Minify: ${file}"
		/usr/bin/env cleancss --skip-rebase --inline none -o "${file}.min" "${file}"
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
	echo "Build extension for Chrome"
	# exit 1
}

function buildImages() {
	echo "Build images for Chrome"
	# exit 1
}

target=${@:$OPTIND:1}

case $target in
	"firefox") buildFirefox;;
	"chrome") buildChrome;;
	"icon") buildImages;;
	*) usage;;
esac
