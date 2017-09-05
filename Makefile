
SHELL := /bin/bash
PATH  := ./node_modules/.bin:$(PATH)

SRC_FILES := $(shell find src -name '*.ts')

all: lib bundle docs

lib: $(SRC_FILES) node_modules
	tsc -p tsconfig.json --outDir lib && \
	V=`node -p 'require("./package.json").version'` && \
	sed -e "s}require('./../package.json').version}'$${V}'}" \
	-i '' lib/version.js && touch lib

dist/dsteem.js: $(SRC_FILES) node_modules lib
	browserify src/index-browser.ts --debug \
		--standalone dsteem --plugin tsify \
		--transform [ babelify --extensions .ts ] \
		| derequire > dist/dsteem.js
	uglifyjs dist/dsteem.js \
		--source-map "content=inline,url=dsteem.js.map,filename=dist/dsteem.js.map" \
		--compress "dead_code,collapse_vars,reduce_vars,keep_infinity,drop_console,passes=2" \
		--output dist/dsteem.js

dist/dsteem.d.ts: $(SRC_FILES) node_modules
	dts-generator --name dsteem --project . --out dist/dsteem.d.ts
	sed -e "s/^declare module 'dsteem\/index'/declare module 'dsteem'/" -i '' dist/dsteem.d.ts

dist/dsteem.js.gz: dist/dsteem.js
	gzip --best --keep --force dist/dsteem.js

bundle: dist/dsteem.js.gz dist/dsteem.d.ts

.PHONY: coverage
coverage: node_modules
	nyc -r html -r text -e .ts -i ts-node/register mocha --reporter nyan --require ts-node/register test/*.ts

.PHONY: test
test: node_modules lib
	mocha --require ts-node/register test/*.ts --grep '$(grep)'

.PHONY: ci-test
ci-test: node_modules
	tslint -p tsconfig.json -c tslint.json
	nyc -r lcov -e .ts -i ts-node/register mocha --reporter tap --require ts-node/register test/*.ts

.PHONY: lint
lint: node_modules
	tslint -p tsconfig.json -c tslint.json -t stylish --fix

node_modules:
	npm install

docs: $(SRC_FILES) node_modules
	typedoc --gitRevision master --target ES6 --mode file --out docs src
	find docs -name "*.html" | xargs sed -i '' 's~$(shell pwd)~.~g'
	echo "Served at <https://jnordberg.github.io/dsteem/>" > docs/README.md
	touch docs

.PHONY: clean
clean:
	rm -rf lib/
	rm -f dist/*
	rm -rf docs/

.PHONY: distclean
distclean: clean
	rm -rf node_modules/
