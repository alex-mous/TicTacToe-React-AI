import React from 'react';
import Square from './Square';

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={ this.props.squares[i] }
        onClick={() => { this.props.onClick(i); }}
        disabled={ this.props.disabled }
      />);
  }

  renderColumns(i) { //Render one row of data
    return (
      this.props.squares.slice(i*this.props.size, (i+1)*this.props.size)
        .map((v,j) =>
          {
            return (
              <td key={i*this.props.size+j}>
                { this.renderSquare(i*this.props.size+j) }
              </td>
            )
          }
        )
    );
  }

  renderRows() { //Render the rows of data
    return this.props.squares
      .filter((v, i) => { return i%this.props.size === 0; }) //Filter so only rows left
      .map((v, i) => { //map each row
        return (
          <tr key={i}>
            {this.renderColumns(i)}
          </tr>
        );
      })
  }

  render() {
    return (
        <table>
          <tbody>
            { this.renderRows() }
          </tbody>
        </table>
    );
  }
}

export default Board;
