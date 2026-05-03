import { createContext, useContext } from "react";

type ViewHintsContextValue = {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
};

const ViewHintsContext = createContext<ViewHintsContextValue | null>(null);

export function ViewHintsProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: ViewHintsContextValue;
}) {
  return <ViewHintsContext.Provider value={value}>{children}</ViewHintsContext.Provider>;
}

export function useViewHints(): ViewHintsContextValue {
  const ctx = useContext(ViewHintsContext);
  if (!ctx) {
    return { enabled: true, setEnabled: () => {} };
  }
  return ctx;
}
