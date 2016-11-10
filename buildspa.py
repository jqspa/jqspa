#!/usr/bin/env python3

import re, requests, subprocess

def js_gcc(code):
	try:
		print('local')
		res = subprocess.getoutput('java -jar lib/closure-compiler.jar -W QUIET spa.js')
	except e:
		print('local failed\ncalling google...')
		res = requests.post('https://closure-compiler.appspot.com/compile', {
			'output_format': 'text',
			'output_info': 'compiled_code',
			'compilation_level': 'SIMPLE_OPTIMIZATIONS',
			'js_code' : code,
		}).text

	return res

def parseLine(line):
 	match = re.match('^(?P<pre>[\s\t]*)spa\.includeScript\([\s\t]*[\'\"]\/?(?P<dir>.+)[\'\"][\s\t]*\)',line, re.X)
 	
 	if match:
 		
 		return parseFile(match.groupdict()['dir'], match.groupdict()['pre'])
 	
 	return line

def parseFile(file, pre=None):
	pre = pre if pre else ''
	with open(file) as file:
		
		return ''.join(parseLine(pre+line) for line in file);

if __name__ == "__main__":
	code = parseFile('src/spa.js')

	with open('spa.js', 'w') as file:
		file.write(code)
	with open('spa.min.js', 'w') as file:
		file.write(js_gcc(code))

	print('built')
	exit(0)
