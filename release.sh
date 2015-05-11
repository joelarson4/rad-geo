set -e

gulp release
git push

cd gh-pages
rm -rf build
mkdir build
cp ../build/* build
rm demo.html
cp ../demo.html .

git add -u
git commit --m 'Sync with master'
git push