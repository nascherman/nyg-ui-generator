'use strict';
import React, {PropTypes} from 'react';

class {{component}} extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    // component has not been rendered to DOM yet
    // process any data here if needed
  }

  componentDidMount() {
    // component has been rendered to DOM
  }

  componentWillReceiveProps(nextProps) {
    // component has already rendered but will re-render when receives new props
  }

  componentWillUnmount() {
    // component is about to be removed from DOM
    // clean up any event listeners ect. here
  }

  render() {
    const style = Object.assign({}, {}, this.props.style);
    const className = '';

    return (
      <div
        className={`${className} ${this.props.className}`}
        style={style}
      >
        This is {{component}} (React component)
      </div>
    )
  }
}

{{component}}.propTypes = {
  style: PropTypes.object,
  className: PropTypes.string

};

{{component}}.defaultProps = {
  style: {},
  className: ''
};

export default {{component}};