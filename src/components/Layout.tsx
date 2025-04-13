
import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto px-4 py-4">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
