
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Home, Key } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAIKey } from '@/contexts/AIKeyContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const location = useLocation();
  const { isKeySet } = useAIKey();
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
      <Link to="/" className="flex items-center gap-2">
        <motion.div
          initial={{ rotate: -10 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 0.5 }}
        >
          <BrainCircuit className="h-8 w-8 text-primary" />
        </motion.div>
        <motion.h1 
          className="text-2xl font-bold"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          N-Anki Card Creator
        </motion.h1>
      </Link>
      
      <div className="flex items-center gap-2">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/">
                <NavigationMenuLink 
                  className={cn(
                    navigationMenuTriggerStyle(),
                    location.pathname === '/' && 'bg-accent text-accent-foreground'
                  )}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/create">
                <NavigationMenuLink 
                  className={cn(
                    navigationMenuTriggerStyle(),
                    location.pathname === '/create' && 'bg-accent text-accent-foreground'
                  )}
                >
                  <BrainCircuit className="h-4 w-4 mr-2" />
                  Create Cards
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/api-key">
                <NavigationMenuLink 
                  className={cn(
                    navigationMenuTriggerStyle(),
                    location.pathname === '/api-key' && 'bg-accent text-accent-foreground',
                    !isKeySet && 'text-destructive'
                  )}
                >
                  <Key className="h-4 w-4 mr-2" />
                  API Key
                  {!isKeySet && (
                    <motion.div 
                      className="ml-2 w-2 h-2 rounded-full bg-destructive"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                  )}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Navbar;
