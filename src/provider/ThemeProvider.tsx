import { ReactNode } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import useToggle from '../hooks/useToggle';

const ThemeProvider = ({children}: {children: ReactNode}) => {

    const {isToggled : isDark, toggleHandler : toggleDarkHandler} = useToggle();
    
  return (
    <ThemeContext.Provider  value={{isDark, toggleDarkHandler}}>
        {children}
    </ThemeContext.Provider>
  )
}

export default ThemeProvider