const fs = require('fs');
import hbs from 'handlebars';
import domify from 'domify';

const {{component}} = () => {

};

{{component}}.prototype = {
  init(req, done) {
    this.dom = domify(hbs.compile(fs.readFileSync(__dirname + '/template.hbs', 'utf8'))());
    document.body.appendChild(this.dom);

    done();
  },

  animateIn(req, done) {
    done();
  },

  animateOut(req, done) {
    done();
  },

  destroy() {

  }
};

export default {{component}};