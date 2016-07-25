# nyg-ui-generator
UI scaffold generator and module publisher.

## Install
Generator based on [nyg](https://www.npmjs.com/package/nyg) and [nyg-module-generator](https://www.npmjs.com/package/nyg-module-generator). 
Prerequisites: [nyg](https://www.npmjs.com/package/nyg) needs to be installed globally. Please follow instructions.

```npm i nyg-ui-generator -g```

## Usage
```
cd your-project-directory
nyg nyg-ui-generator
```
You will then be prompted with a number of questions, which will define the type of UI component you want to generate, where to put it, and whether you want to publish it to a GitHub repo. The appropriate files will then be copied to the specified path and all the dependencies will be installed. 

## Test
After installation it will automatically run the UI component in your browser.

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
