import Header from "./Header";
import Footer from "./Footer";
import FontControls from "./FontControls";

export default function Layout({ children, showFontControls = true }) {
  return (
    <>
      <Header />
      {showFontControls && <FontControls />}
      {children}
      <Footer />
    </>
  );
}
