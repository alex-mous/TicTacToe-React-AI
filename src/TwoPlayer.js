import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Square extends React.Component { //Each square on the board
  render() {
    return (
      <div className="btn" onClick={() => { this.props.onClick(); }}>
        { this.props.value }
      </div>
    );
  }
}


class ResetButton extends React.Component {
  render() {
    return (
      <button className="reset-btn" onClick={() => { this.props.onClick() }}>
        Reset game
      </button>
    );
  }
}

class Game extends React.Component { //Main game component
  constructor(props) {
    super(props);
    this.state = {
      stat_index: 0, //Index of the current state in history
      history: [
        {
          squares: Array(9).fill(null),
          current: "X",
          running: true,
          msg: "Next player: X"
        }
      ]
    }
  }

  renderResetButton() {
    if (this.state.history.length > 1 && !this.state.history[this.state.stat_index].running) {
      return <ResetButton onClick={() => { this.resetGame() }} />;
    } else {
      return null;
    }
  }

  resetGame() {
    this.setState({
      stat_index: 0, //Index of the current state in history
      history: [
        {
          squares: Array(9).fill(null),
          current: "X",
          running: true,
          msg: "Next player: X"
        }
      ]
    });
  }

  addBlankState() {
    const hist = this.state.history;
    hist.push({
      squares: Array(9).fill(null),
      current: "X",
      running: true,
      msg: "Next player: X"
    });
    this.setState({history: hist});
  }

  clickHandler(i) {
    if (this.state.history[this.state.stat_index].running) { //Only allow clicks if running
      //First create a new snapshot to work in
      this.addBlankState();
      this.setState({ stat_index: this.state.stat_index+1 });
      const ind = this.state.stat_index; //Helper variable
      alert(ind);
      const squares = this.state.history[ind].squares.slice(); //Get a copy of the Array
      if (squares[i] == null) { //Prevent altering already set squares
        const temp = this.state.history;
        squares[i] = temp[ind].current;
        this.setState({ history: temp }); //Set it back to the global state
        if (this.gameOver(squares)) { //Check if game is won
          const temp = this.state.history;
          temp[ind].msg = "Player " + temp[ind].current + " won!";
          temp[ind].running = !temp[ind].running;
          this.setState({ history:temp });
        } else {
          var tie = true; //Check for ties by iterating over array
          for (var i=0; i<=8; i++) {
            if (squares[i] == null) {
              tie = false;
              break;
            }
          }
          if (tie) {
            const temp = this.state.history;
            temp[ind].msg = <h3>Game Tied!</h3>;
            this.setState({ histroy: temp });
            this.state.history[ind].running = !this.state.history[ind].running;
          } else {
            //Set the next player
            if (this.state.history[ind].current == "X") {
              this.setPlayer("O");
            } else {
              this.setPlayer("X");
            }
          }
        }
      }
    }
  }

  setPlayer(player) { //Set player to show in message
    const temp = this.state.history;
    temp[this.state.stat_index].current = player;
    temp[this.state.stat_index].msg = "Next player: " + player;
    this.setState({ history: temp });
  }

  gameOver(sq) { //Returns boolean, true if winner
    //Need to check for three consecutive non-null values
    //Horizontal
    for (var i=0; i<8; i+=3) {
      if (sq[i] != null && sq[i] == sq[i+1] && sq[i] == sq[i+2]) {
        return true;
      }
    }

    //Vertical
    for (var i=0; i<=3; i++) {
      if (sq[i] != null && sq[i] == sq[i+3] && sq[i] == sq[i+6]) {
        return true;
      }
    }

    //Diagonal
    return ((sq[0] != null && sq[0] == sq[4] && sq[0] == sq[8]) || (sq[2] != null && sq[2] == sq[4] && sq[2] == sq[6]));
  }

  renderSquare(i) {
    return (
      <Square
        value={ this.state.history[this.state.stat_index].squares[i] }
        onClick={() => { this.clickHandler(i); }}
      />
    );
  }

  render() {
    return (
      <div>
        <p>{ this.state.history[this.state.stat_index].msg }</p> { this.renderResetButton() }
        <table>
          <tbody>
            <tr>
              <td>
                { this.renderSquare(0) }
              </td>
              <td>
                { this.renderSquare(1) }
              </td>
              <td>
                { this.renderSquare(2) }
              </td>
            </tr>
            <tr>
              <td>
                { this.renderSquare(3) }
              </td>
              <td>
                { this.renderSquare(4) }
              </td>
              <td>
                { this.renderSquare(5) }
              </td>
            </tr>
            <tr>
              <td>
                { this.renderSquare(6) }
              </td>
              <td>
                { this.renderSquare(7) }
              </td>
              <td>
                { this.renderSquare(8) }
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}


ReactDOM.render(<Game />, document.getElementById("root"));
