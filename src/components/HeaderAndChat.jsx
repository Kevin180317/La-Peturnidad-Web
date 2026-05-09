import React, { useState } from "react";
import NavBar from "./NavBar.jsx";
import ChatButton from "./Home/ChatButton";

function HeaderAndChat({ lang }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <NavBar
        lang={lang}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />
      {!isMenuOpen && <ChatButton lang={lang} client:only="react" />}
    </>
  );
}

export default HeaderAndChat;
