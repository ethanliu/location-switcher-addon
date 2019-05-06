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

	rm -fr $tmp
	cp -aR firefox $tmp

	cd $tmp
	version=`cat manifest.json | sed -n "s/.*\"version\": \"\(.*\)\".*/\1/p"`
	echo "Build extension for Firefox"
	echo "Version: ${version}"

	for file in `find . -type f -name "*.js"`; do
		echo "Minify: ${file}"
		# /usr/bin/env uglifyjs "${file}" > "${file}.min"
		# just remove comments
		/usr/bin/env uglifyjs "${file}" -o "${file}.min" -b
		rm "${file}"
		mv "${file}.min" "${file}"
	done

	for file in `find . -type f -name "*.css"`; do
		echo "Minify: ${file}"
		/usr/bin/env cleancss --skip-rebase --inline none -o "${file}.min" "${file}"
		rm "${file}"
		mv "${file}.min" "${file}"
	done

	# echo "Package: ${zipfile}"
	# zipfile="../dist/location-switcher-firefox-addon-${version}.zip"
	# mkdir -p ../dist
	# zip -r -FS -q "${zipfile}" * -x "*.DS_Store"

	cd ..

	/usr/bin/env web-ext build -s $tmp -a dist --overwrite-dest

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

target=${@:$OPTIND:1}

case $target in
	"firefox") buildFirefox;;
	"chrome") buildChrome;;
	"icon") buildImages;;
	*) usage;;
esac
