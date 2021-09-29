#!/bin/sh
# https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/

function usage() {
cat << EOF

Usage: `basename $0` <target>

Targets:

	firefox				Build Firefox extension
	firefox-advanced		Build Firefox extension (advanced version)
	chrome				Build Chrome extension
	icon				Build images for Chrome extension
	test				Run eslint for every js file

EOF
exit 0
}

function buildFirefox() {
	if [[ $1 == true ]]; then
		buildName="firefox-advanced"
	else
		buildName="firefox"
	fi

	tmp="tmp"

	mkdir -p dist
	rm -fr $tmp
	cp -aR $buildName $tmp

	if [ "${buildName}" = "firefox-advanced" ]; then
		cp -a firefox/icons "${tmp}/"
	fi

	cd $tmp
	version=`cat manifest.json | sed -n "s/.*\"version\": \"\(.*\)\".*/\1/p"`
	echo "Target: ${buildName}\nVersion: ${version}\n"

	/usr/bin/env web-ext lint

	# echo "Build archive for code review..."
	cp ../README.md ./;
	zipfile="../dist/location-switcher-${buildName}-${version}-source.zip"
	/usr/bin/env zip -r -FS -q "${zipfile}" * -x "*.DS_Store"

	for file in `find . -type f -name "*.js"`; do
		echo "Minify: ${file}"
		/usr/bin/env uglifyjs "${file}" -o "${file}.min" --compress
		rm "${file}"
		mv "${file}.min" "${file}"
	done

	for file in `find . -type f -name "*.css"`; do
		echo "Minify: ${file}"
		/usr/bin/env cleancss --inline none -o "${file}.min" "${file}"
		rm "${file}"
		mv "${file}.min" "${file}"
	done

	# /usr/bin/env web-ext lint

	# remove unnecessary files
	# rm *.md
	echo

	cd ..

	/usr/bin/env web-ext build -s $tmp -a dist --overwrite-dest --ignore-files "**/*.md"

	rm -fr $tmp
}

function buildChrome() {
	echo "Build extension for Chrome"

	tmp="tmp"

	rm -fr $tmp
	cp -aR chrome $tmp
	/usr/bin/env web-ext build -s $tmp -a dist
	rm -fr $tmp
}

function buildImages() {
	echo "Generate PNG images from SVG"

	# brew install imagemagick --with-librsvg
	# brew install librsvg

	# /usr/bin/env convert -background none firefox/icons/dark/bug.svg chrome/icons/bug.png
	# /usr/bin/env rsvg-convert -w 32 -h 32 -b none -o chrome/icons/bug.png firefox/icons/dark/bug.svg
	# /Applications/Inkscape.app/Contents/Resources/script --without-gui -y 0.0 -w 32 -h 32 -e ./chrome/icons/bug.png ./firefox/icons/dark/bug.svg


	rm -fr chrome/icons

	themes=( light dark )
	size=48
	for theme in "${themes[@]}"; do
		mkdir -p "chrome/icons/${theme}"
		for file in firefox/icons/$theme/*.svg; do
			filename=`basename $file`
			filename="${filename/.svg/}"

			# qlmanage -t -s 32 -o "chrome/icons/${theme}" "${file}"
			# mv "chrome/icons/${theme}/${filename}.svg.png" "chrome/icons/${theme}/${filename}.png"

			# /usr/bin/env convert -background none -draw "image over 0,0 0,0" firefox/icons/$theme/$filename.svg chrome/icons/$theme/$filename.png

			/usr/bin/env rsvg-convert -w $size -h $size -b none -o chrome/icons/$theme/$filename.png firefox/icons/$theme/$filename.svg
		done
	done

	# /usr/bin/env convert -background none -density 300 firefox/icons/light/default.svg chrome/icons/default.svg.png
	#
	sizes=( 16 32 48 128 512 )
	for size in "${sizes[@]}"; do
		# qlmanage -t -s $size -o chrome/icons firefox/icons/light/default.svg
		# mv chrome/icons/default.svg.png chrome/icons/default-$size.png

		# /usr/bin/env convert -background none -resize "${size}x${size}" chrome/icons/default.svg.png chrome/icons/default-$size.png
		# /usr/bin/env identify chrome/icons/default-$size.png

		/usr/bin/env rsvg-convert -w $size -h $size -b none -o chrome/icons/default-$size.png firefox/icons/light/default.svg
	done
}

function test() {
	# cd firefox; /usr/bin/env web-ext lint; cd ..
	# cd firefox-advanced; /usr/bin/env web-ext lint; cd ..
	for path in `find . -type f -name "*.js"`; do
		/usr/bin/env eslint $path
	done
}

target=${@:$OPTIND:1}

case $target in
	"firefox") buildFirefox false;;
	"firefox-advanced") buildFirefox true;;
	"chrome") buildChrome;;
	"icon") buildImages;;
	"test") test;;
	*) usage;;
esac
