import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

export type ViewMode = "general" | "project";

interface ViewContextProps {
  view: ViewMode;
  setView: Dispatch<SetStateAction<ViewMode>>;
  activeProjectId: string | null;
  setActiveProjectId: (projectId: string | null) => void;
  // We can add project ID state here later
  // currentProjectId: string | null;
  // setCurrentProjectId: Dispatch<SetStateAction<string | null>>;
}

const ViewContext = createContext<ViewContextProps | undefined>(undefined);

export const ViewProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [view, setView] = useState<ViewMode>("general");
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  // const [currentProjectId, setCurrentProjectId] = useState<string | null>(null); // Placeholder for later

  // Add logic here later to load the last project when switching to 'project' view
  // For now, just switch the view mode.

  return (
    <ViewContext.Provider
      value={{ view, setView, activeProjectId, setActiveProjectId }}
    >
      {children}
    </ViewContext.Provider>
  );
};

export const useView = (): ViewContextProps => {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error("useView must be used within a ViewProvider");
  }
  return context;
};
