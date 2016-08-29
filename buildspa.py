#!/usr/bin/env python3

import re, requests
from css_html_js_minify import html_minify, js_minify, css_minify

def js_gcc(code):
	res = requests.post('https://closure-compiler.appspot.com/compile', {
		'output_format': 'text',
		'output_info': 'compiled_code',
		'compilation_level': 'SIMPLE_OPTIMIZATIONS',
		'js_code' : code,
	})
	print(res)
	return res.text

def parseLine(line):
 	match = re.match(
 		'^(?P<pre>[\s\t]*)spa\.includeScript\([\s\t]*[\'\"]\/?(?P<dir>.+)[\'\"][\s\t]*\)',line, re.X)
 	if match:
 		return parseFile(match.groupdict()['dir'], match.groupdict()['pre'])
 	return line

def parseFile(file, pre=None):
	pre = pre if pre else ''
	with open(file) as file:
		return ''.join(parseLine(pre+line) for line in file);

if __name__ == "__main__":
	with open('spa.min.js', 'w') as file:

		file.write(parseFile('spa.js'))


# html_minify('  <p>yolo<a  href="/" >o </a >     <!-- hello --></p>')
# '<p>yolo<a href="/" >o </a > </p>'

# js_minify('var i = 1; i += 2 ;\n alert( "hello  "  ); //hi')
# 'var i=1;i+=2;alert("hello  ");'

# css_minify('body {width: 50px;}\np {margin-top: 1em;/* hi */  }', comments=False)
# '@charset utf-8;body{width:50px}p{margin-top:1em}'
