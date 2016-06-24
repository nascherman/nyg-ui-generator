'use strict';
import React, {PropTypes} from 'react';

class NewReactComponent extends React.Component {
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

  componentWillUnmout() {
    // component is about to be removed from DOM
    // clean up any event listeners ect. here
  }

  render() {
    const style = Object.assign({}, {}, this.props.style);

    return (
      <div
        className={`new-react-component ${this.props.className}`}
        style={style}
      >
        Hello, I'm a new React component
      </div>
    )
  }
}

NewReactComponent.propTypes = {
  style: PropTypes.object,
  className: PropTypes.string

};

NewReactComponent.defaultProps = {
  style: {
    color: '#fff'
  },
  className: ''
};

export default NewReactComponent;