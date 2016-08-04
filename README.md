# nyg-ui-generator
Generator is based on [nyg](https://www.npmjs.com/package/nyg) and [nyg-module-generator](https://www.npmjs.com/package/nyg-module-generator).

## Prerequisites

Following modules need to be installed globally:
* [nyg](https://www.npmjs.com/package/nyg) 
* [nyg-module-generator](https://www.npmjs.com/package/nyg-module-generator)
* [ghrepo](https://github.com/Jam3/ghrepo)

do:
```
npm i ghrepo -g
npm i nyg -g
npm i nyg-module-generator -g
```

You also need to have your user npm configurations set such as `init.author.name`, `init.author.email` and `init.author.github`. 
Check existing configs using `npm config get` and set missing props using `npm config set someProp "some-value"`

## Install
```
npm i nyg-ui-generator -g
```

## Usage
```
nyg nyg-ui-generator
```
You will then be prompted with a number of questions, which will define the type of UI component you want to generate, where to put it, and whether you want to publish it.

There are 3 options:

**1. Generate UI component files** - simply create boilerplate files (js, styles, templates). Recommended to run generator from project's root for this option.
You'll be asked for:
 * path - where to put the new component (default: cwd)
 * component folder name - folder to be created under specified path (default: MyComponent)
 * component name - component's class name inside JS file (default: MyComponent)
 * UI type (React, React-F1, or Bigwheel)
 * whether you want to rename your index.js (e.g MyComponent.js). Default is 'No'
 
 Generator will copy files into new component folder and show it in your file browser

**2. Create UI module** - generate UI module with boilerplate files and set up test and example. Recommended that you have a specific global folder for all your generated modules. You'll be asked for:
 * path - where to put the new component (default: your modules folder e.g `/Users/name/modules/`)
 * module name - respective folder will be created under specified path
 * other module specific questions like description, kew words etc
 * component name - component's class name inside JS file (default: MyComponent)
 * UI type (React, React-F1, or Bigwheel)
 
  Generator will copy files into new component folder, install all dependencies, show component folder in your file browser and run example in your browser.

  Afterwards, you'll be asked about publishing the UI module to GitHub and npm.

**3. Post publish** - publish existing component as module. **IMPORTANT: to run this, you have to be in the component folder**. Generator will try to read existing config file and get the information about UI type, index file name, etc. If `nyg-cfg.json` is missing in the component folder or no information about type or name is available, then user will be asked about it.
   
  Generator will proceed with similar to **Create UI module** steps. Suggested that files will be copied to and published from your default modules folder (e.g. `/Users/name/modules/`) which you will be asked about.

  NOTE: when reading `nyg-cfg.json` and detecting index file (for pointing examples/tests files):
  * if there's file named`index.js` or there's only one JS file exists in the component root, it will be assigned as index
  * if there's no `index.js` + there are multiple JS files and no rename information in the config file, then user will be prompted to choose their index file (entry point) from the list
   
  **IF THERE ARE PROBLEMS WITH READING `nyg-cfg.json`** and generator unexpectedly exits, user can remove the config file, then they will be prompted for missing info.
 
## Test
To manually run the example in your browser
```
cd your-ui-component-directory
npm start
```

To manually run test
```
cd your-ui-component-directory
npm test
```


## License

MIT, see [LICENSE.md](http://github.com/Jam3/nyg-ui-generator/blob/master/LICENSE.md) for details.
