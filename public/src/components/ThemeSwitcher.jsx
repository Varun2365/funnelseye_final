import React from 'react';
import { Button } from './ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Sun, Moon, Monitor, Palette } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSwitcher = ({ variant = 'default', size = 'sm' }) => {
  const { theme, toggleTheme, setLightTheme, setDarkTheme, isDark } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      default:
        return 'System';
    }
  };

  if (variant === 'simple') {
    return (
      <Button
        variant="ghost"
        size={size}
        onClick={toggleTheme}
        className="relative"
        title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      >
        {getThemeIcon()}
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size={size}
          className="flex items-center space-x-2"
        >
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline">{getThemeLabel()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={setLightTheme} className="flex items-center space-x-2">
          <Sun className="h-4 w-4" />
          <span>Light</span>
          {theme === 'light' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={setDarkTheme} className="flex items-center space-x-2">
          <Moon className="h-4 w-4" />
          <span>Dark</span>
          {theme === 'dark' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleTheme} className="flex items-center space-x-2">
          <Monitor className="h-4 w-4" />
          <span>Toggle Theme</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSwitcher;
