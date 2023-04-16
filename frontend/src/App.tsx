import './App.css';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';

function App() {
  return (
    <div className="App">
      <header className="App-header">

        <SnackbarProvider />
        <button onClick={() => enqueueSnackbar('That was easy!')}>Show snackbar</button>
      </header>
    </div>
  );
}

export default App;
