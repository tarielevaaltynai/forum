import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import css from "./index.module.scss";

// Создаем контекст темы
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
});

// Хук для использования темы
export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      return savedTheme ? savedTheme === "dark" : prefersDark;
    }
    return false;
  });

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  useEffect(() => {
    // Добавляем/удаляем класс .dark на <html> для глобальной смены темы
    document.documentElement.classList.toggle("dark", isDark);

    // Сохраняем предпочтение в localStorage
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Компонент кнопки для переключения темы
export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={css.themeToggle}
      aria-label={
        isDark ? "Переключить на светлую тему" : "Переключить на тёмную тему"
      }
    >
      <div className={css.toggleContainer}>
        {isDark ? (
          <span className={css.icon}>🌙</span>
        ) : (
          <span className={css.icon}>☀️</span>
        )}
      </div>
    </button>
  );
};
