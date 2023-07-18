echo 'POSTBUILD: copying kit files to next-axiom'
SOURCE_DIR=../../internal/kit/dist/
TARGET_DIR=./dist/kit/
rm -r $TARGET_DIR
cp -r $SOURCE_DIR $TARGET_DIR
