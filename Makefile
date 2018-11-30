
SHELL := /bin/bash
PATH  := ./node_modules/.bin:$(PATH)

SRC_FILES := $(shell find src -name '*.ts')

define VERSION_TEMPLATE
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = '$(shell node -p 'require("./package.json").version')';
endef

all: lib bundle docs

export VERSION_TEMPLATE
lib: $(SRC_FILES) node_modules
	tsc -p tsconfig.json --outDir lib && \
	echo "$$VERSION_TEMPLATE" > lib/version.js
	touch lib

dist/%.js: lib
	browserify $(filter-out $<,$^) --debug --full-paths \
		--standalone dsteem --plugin tsify \
		--transform [ babelify --extensions .ts ] \
		| derequire > $@
	uglifyjs $@ \
		--source-map "content=inline,url=$(notdir $@).map,filename=$@.map" \
		--compress "dead_code,collapse_vars,reduce_vars,keep_infinity,drop_console,passes=2" \
		--output $@ || rm $@

dist/dsteem.js: src/index-browser.ts

dist/dsteem.d.ts: $(SRC_FILES) node_modules
	dts-generator --name dsteem --project . --out dist/dsteem.d.ts
	sed -e "s@'dsteem/index'@'dsteem'@g" -i '' dist/dsteem.d.ts

dist/%.gz: dist/dsteem.js
	gzip -9 -f -c $(basename $@) > $(basename $@).gz

bundle: dist/dsteem.js.gz dist/dsteem.d.ts

.PHONY: coverage
coverage: node_modules
	nyc -r html -r text -e .ts -i ts-node/register mocha --exit --reporter nyan --require ts-node/register test/*.ts

.PHONY: test
test: node_modules
	mocha --exit --require ts-node/register -r test/_node.js test/*.ts --grep '$(grep)'

.PHONY: ci-test
ci-test: node_modules
	tslint -p tsconfig.json -c tslint.json
	nyc -r lcov -e .ts -i ts-node/register mocha --exit --reporter tap --require ts-node/register test/*.ts

.PHONY: browser-test
browser-test: dist/dsteem.js
	BUILD_NUMBER="$$(git rev-parse --short HEAD)-$$(date +%s)" \
		karma start test/_karma-sauce.js

.PHONY: browser-test-local
browser-test-local: dist/dsteem.js
	karma start test/_karma.js

.PHONY: lint
lint: node_modules
	tslint -p tsconfig.json -c tslint.json -t stylish --fix

node_modules:
	yarn install --non-interactive --frozen-lockfile

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
