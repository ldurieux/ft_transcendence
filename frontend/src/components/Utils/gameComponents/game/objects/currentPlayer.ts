namespace Pong
{
    export class CurrentPlayer extends Player
    {
        private handleKeydown = evt => {
            switch (evt.keyCode) {
              case Utils.KeyCode.UP_ARROW:
                this._direction = Direction.UP;
                break;
              case Utils.KeyCode.DOWN_ARROW:
                this._direction = Direction.DOWN;
                break;
              default:
                this._direction = null;
            }
        };
      
        private handleKeyup = _ => {
            this._direction = null;
        };
      
        bind() {
            window.addEventListener('keydown', this.handleKeydown);
            window.addEventListener('keyup', this.handleKeyup);
        }
      
        unbind() {
            window.removeEventListener('keydown', this.handleKeydown);
            window.removeEventListener('keyup', this.handleKeyup);
        } 
    }
}