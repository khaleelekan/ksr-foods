import "./globals.css";
import CartProvider from "@/components/CartProvider";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";

export const metadata = {
  title: "KSR Foods | So Fast, So Yummy!",
  description: "Poundo flours, Ofada rice, palm oil, honey, garri and more from KSR Foods.",
  icons: { icon: "/images/logo.jpeg" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Header />
          {children}
          <footer className="site-footer">
            <p><strong>KSR Foods</strong> | WhatsApp <a href="https://wa.me/2348077029452">0807 702 9452</a> | <a href="tel:+2348039568762">0803 956 8762</a></p>
            <p><a href="https://www.instagram.com/ksrfoods.ng/" target="_blank" rel="noopener noreferrer">@ksrfoods.ng on Instagram</a></p>
          </footer>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
