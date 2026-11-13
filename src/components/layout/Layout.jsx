import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface dark:bg-surface-dark text-ink-800 dark:text-ink-200">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}