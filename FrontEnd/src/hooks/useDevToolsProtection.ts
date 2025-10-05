import { useEffect } from 'react';

export const useDevToolsProtection = () => {
  useEffect(() => {
    // Disable right-click context menu
    const disableRightClick = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S
    const disableDevKeys = (e: KeyboardEvent) => {
      // F12
      if (e.keyCode === 123) {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+I (Dev Tools)
      if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+U (View Source)
      if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+S (Save)
      if (e.ctrlKey && e.keyCode === 83) {
        e.preventDefault();
        return false;
      }
      
      return true;
    };

    // Clear console periodically and detect dev tools
    const protectConsole = () => {
      // Override console methods
      const originalLog = console.log;
      const originalWarn = console.warn;
      const originalError = console.error;
      const originalInfo = console.info;
      const originalDebug = console.debug;
      
      console.log = () => {};
      console.warn = () => {};
      console.error = () => {};
      console.info = () => {};
      console.debug = () => {};
      
      // Detect dev tools by checking window dimensions
      let devtools = false;
      const checkDevTools = () => {
        const threshold = 160;
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
          if (!devtools) {
            devtools = true;
            // Optionally redirect or show warning
            console.clear();
            window.location.href = 'about:blank';
          }
        } else {
          devtools = false;
        }
      };

      // Check for dev tools every 500ms
      const devToolsInterval = setInterval(checkDevTools, 500);
      
      // Clear console every 1 second
      const clearConsoleInterval = setInterval(() => {
        console.clear();
      }, 1000);

      return () => {
        // Restore original console methods
        console.log = originalLog;
        console.warn = originalWarn;
        console.error = originalError;
        console.info = originalInfo;
        console.debug = originalDebug;
        
        clearInterval(devToolsInterval);
        clearInterval(clearConsoleInterval);
      };
    };

    // Disable text selection
    const disableSelection = () => {
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
    };

    // Apply protections
    document.addEventListener('contextmenu', disableRightClick);
    document.addEventListener('keydown', disableDevKeys);
    disableSelection();
    const cleanupConsole = protectConsole();

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', disableRightClick);
      document.removeEventListener('keydown', disableDevKeys);
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      cleanupConsole();
    };
  }, []);
};