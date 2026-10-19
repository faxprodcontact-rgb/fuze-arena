#!/bin/sh
# ac-crop.sh nom viewBox  -> previews/ac-crops/nom-crop.svg
src=art/$1.svg; out=previews/ac-crops/$1-crop.svg
sed "1s|viewBox=\"[^\"]*\"|viewBox=\"$2\"|" $src > $out
