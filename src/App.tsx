import "./app.css";
import { PhazerProvider } from "./context/phazerProvider";
import Phazer from "./Phazer";

function App() {
  return (
    <PhazerProvider>
      <Phazer />
    </PhazerProvider>
  );
}

export default App;
