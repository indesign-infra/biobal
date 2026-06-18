import { component$, Slot } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { Header } from "~/components/layout/header";
import { Footer } from "~/components/layout/footer";
import { Chatbot } from "~/components/chatbot/chatbot";

export default component$(() => {
  const location = useLocation();
  // El panel /admin tiene su propio layout; no lleva el header/footer público.
  const isAdmin = location.url.pathname.startsWith("/admin");

  if (isAdmin) {
    return <Slot />;
  }

  return (
    <>
      <Header />
      <main id="inicio">
        <Slot />
      </main>
      <Footer />
      <Chatbot />
    </>
  );
});
