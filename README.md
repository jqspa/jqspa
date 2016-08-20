##page object
	`url` String **requires**
		regex match for url path
		**DO NOT PUT SLASHES!**

	`template` String
		string of HTML to be parsed by Mustache

	`action` Function
		If a action function, it will run and be responsibly for all changes.
		It should populate `spa.cache.$main` with HTML and assign a title

		If no `action` is specified, the `template` will be rendered to `spa.cache.$main`

	`title` String
		HTML title tag contents

	`context` Object default `{}`
		default Object to be padded to Mustache while rendering	}
