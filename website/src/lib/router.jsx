import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const RouterContext = createContext({ path: "/", navigate: () => { }, transitioning: false });

const normalise = p => (p.replace(/\/+$/, "") || "/");
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function RouterProvider({ children }) {
  const [path, setPath] = useState(() => normalise(window.location.pathname));
  const [transitioning, setTransitioning] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    const onPop = () => { setPath(normalise(window.location.pathname)); window.scrollTo(0, 0); };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const go = useCallback(to => {
    if (to !== window.location.pathname + window.location.search) window.history.pushState({}, "", to);
    setPath(normalise(to.split("?")[0].split("#")[0]));
    window.scrollTo(0, 0);
  }, []);

  const navigate = useCallback(to => {
    const target = normalise(to.split("?")[0].split("#")[0]);
    if (busy.current) return;
    if (target === normalise(window.location.pathname) && !to.includes("?")) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    if (reduced()) { go(to); return; }
    // colour panels cover the screen, the page swaps underneath, then they sweep away
    busy.current = true;
    setTransitioning(true);
    setTimeout(() => { go(to); }, 650);
    setTimeout(() => { setTransitioning(false); busy.current = false; }, 1100);
  }, [go]);

  const value = useMemo(() => ({ path, navigate, transitioning }), [path, navigate, transitioning]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useRouter = () => useContext(RouterContext);

export function Link({ to, children, onClick, ...rest }) {
  const { navigate } = useRouter();
  const internal = to.startsWith("/");
  return (
    <a
      href={to}
      {...rest}
      onClick={e => {
        onClick?.(e);
        if (!internal || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || rest.target === "_blank") return;
        e.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}

// match("/services/:slug", "/services/foo") -> { slug: "foo" } | null
// eslint-disable-next-line react-refresh/only-export-components
export function match(pattern, path) {
  const a = pattern.split("/").filter(Boolean);
  const b = path.split("/").filter(Boolean);
  if (a.length !== b.length) return null;
  const params = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(":")) params[a[i].slice(1)] = decodeURIComponent(b[i]);
    else if (a[i] !== b[i]) return null;
  }
  return params;
}
