// src/App.js
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import { SocketProvider } from "./context/SocketContext";

function App() {
  return (
    <Router>
      <SocketProvider>
        <AppRoutes />
      </SocketProvider>
    </Router>
  );
}

export default App;
