import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
  useCallback,
} from "react";
import { ProjectData } from "@/lib/apiClient"; // Assuming ProjectData interface is here

// Define the shape of the project data state, potentially extending ProjectData
// For now, let's assume it directly uses ProjectData, but we can add more fields later
// (e.g., for unsaved financial inputs, dispatch settings, simulation results)
export type ActiveProjectState = ProjectData & {
  // Add placeholders for data not directly in the 'projects' table yet
  // financialInputs?: Record<string, any>;
  // dispatchSettings?: Record<string, any>;
  // simulationResults?: Record<string, any>;
  // hasUnsavedResults?: boolean;
};

interface ProjectDataContextProps {
  projectData: ActiveProjectState | null;
  setProjectData: (data: ActiveProjectState | null) => void; // Function to load/reset data
  updateProjectField: <K extends keyof ActiveProjectState>(
    field: K,
    value: ActiveProjectState[K]
  ) => void; // Function to update a single field
  isSaved: boolean;
  markAsSaved: () => void;
  markAsUnsaved: () => void; // Can be called implicitly by updateProjectField
  projectId: string | null; // Keep track of the DB ID if saved
  // pipelineId: string | null; // We might get this from projectData itself
}

const ProjectDataContext = createContext<ProjectDataContextProps | undefined>(
  undefined
);

export const ProjectDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [projectData, setProjectDataState] =
    useState<ActiveProjectState | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(true); // Start as saved (or no data)
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  // Function to load a whole project data object (e.g., after fetching)
  const setProjectData = useCallback((data: ActiveProjectState | null) => {
    setProjectDataState(data);
    // When loading fresh data, mark it as saved and store the ID
    setIsSaved(true);
    setCurrentProjectId(data?.project_id ?? null);
    // Reset other potential temporary states if needed
    // e.g., setHasUnsavedResults(false);
  }, []);

  // Function to update a specific field and mark as unsaved
  const updateProjectField = useCallback(
    <K extends keyof ActiveProjectState>(
      field: K,
      value: ActiveProjectState[K]
    ) => {
      setProjectDataState((prevData) => {
        if (!prevData) return null; // Should not happen if editing
        // Create a new object to ensure state update immutability
        const newData = { ...prevData, [field]: value };
        // console.log("Updating field:", field, "Value:", value, "New Data:", newData); // Debugging
        return newData;
      });
      setIsSaved(false);
    },
    []
  );

  const markAsSaved = useCallback(() => {
    setIsSaved(true);
    // Potentially update the stored projectId if a sandbox project was just saved
    if (projectData && !currentProjectId) {
      setCurrentProjectId(projectData.project_id);
    }
    // Reset other temp flags
    // e.g., setHasUnsavedResults(false);
  }, [projectData, currentProjectId]);

  const markAsUnsaved = useCallback(() => {
    setIsSaved(false);
  }, []);

  return (
    <ProjectDataContext.Provider
      value={{
        projectData,
        setProjectData,
        updateProjectField,
        isSaved,
        markAsSaved,
        markAsUnsaved,
        projectId: currentProjectId,
      }}
    >
      {children}
    </ProjectDataContext.Provider>
  );
};

export const useProjectData = (): ProjectDataContextProps => {
  const context = useContext(ProjectDataContext);
  if (context === undefined) {
    throw new Error("useProjectData must be used within a ProjectDataProvider");
  }
  return context;
};
