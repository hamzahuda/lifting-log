import Home from "./pages/Home.jsx";
import { BrowserRouter, Routes, Route } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Logout from "./components/Logout.jsx";
import Register from "./pages/Register.jsx";
import NotFound from "./pages/NotFound.jsx";
import Navbar from "./components/Navbar.jsx";

function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <div>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                {/* This is where the main application code that requires authentication goes */}
                                <Home />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/login" element={<Login />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/*" element={<NotFound />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
