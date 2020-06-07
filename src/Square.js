import React from 'react';
import ReactDOM from 'react-dom';

class Square extends React.Component { //Each square on the board
  render() {
    let className = "square";
    if (this.props.disabled) {
      className += " disabled";
    }
    return (
      <div className={className} onClick={() => { this.props.onClick(); }} >
        { this.props.value }
      </div>
    );
  }
}

export default Square;
