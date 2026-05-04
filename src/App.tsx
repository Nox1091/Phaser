import "./app.css";
import { PhazerProvider } from "./context/phazerProvider";
import Phazer from "./phazer";

function App() {
  return (
    <PhazerProvider>
      <Phazer />
    </PhazerProvider>
  );
}

export default App;
