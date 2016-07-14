# nyg-ui-generator

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

## Install
Generator based on [nyg](https://www.npmjs.com/package/nyg) and [nyg-module-generator](https://www.npmjs.com/package/nyg-module-generator). 
Follow instructions if you haven't alredy installed them. 

Run ```npm i nyg-ui-generator -g```

## Usage
```
cd your-project-directory
nyg nyg-ui-generator
```
You will then be prompted with a number of questions, which will define the type of UI component you want to generate, where to put it, and whether you want to publish it to a GitHub repo. The appropriate files will then be copied to the specified directory and it will install all your needed dependencies. 

# Test
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
