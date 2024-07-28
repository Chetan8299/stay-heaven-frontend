import React, { useEffect, useState } from "react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import { Outlet, useLocation, useNavigationType } from "react-router-dom";
import GlobalStyles from "./GlobalStyles";
import Preloader from "./Preloader";
import "@fortawesome/fontawesome-free/css/all.min.css";

const App = () => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (navigationType !== "POP") {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 700);
      return () => clearTimeout(timer);
    }
  }, [location, navigationType]);

  return (
    <div className="h-screen scrollbar scrollbar-thumb-rounded relative">
      <GlobalStyles />
      {loading && <Preloader />}
      {!loading && (
        <>
          <Navbar />
          <main>
            <Outlet />
          </main>
          <Footer />
        </>
      )}
    </div>
  );
};

export default App; 