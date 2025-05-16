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

// Define the structure for individual revenue stream settings
export interface RevenueStreamSetting {
  dataSourceType?: "supabase" | "csv" | null;
  visualizedYear?: number | null;
  visualizedWeek?: number | null;
  // Add more settings specific to a stream as needed
}

// Define the shape of the project data state, potentially extending ProjectData
export type ActiveProjectState = ProjectData & {
  revenueStreamSettings?: {
    [streamName: string]: RevenueStreamSetting;
  };
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
  // Add a dedicated function for updating nested stream settings for clarity
  updateRevenueStreamSetting: (
    streamName: string,
    settingKey: keyof RevenueStreamSetting,
    value: RevenueStreamSetting[keyof RevenueStreamSetting]
  ) => void;
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

  // Function to update a top-level specific field and mark as unsaved
  const updateProjectField = useCallback(
    <K extends keyof ActiveProjectState>(
      field: K,
      value: ActiveProjectState[K]
    ) => {
      // Prevent direct update of revenueStreamSettings here if using dedicated function
      if (field === "revenueStreamSettings") {
        console.warn(
          "Use updateRevenueStreamSetting for modifying stream settings."
        );
        return;
      }
      setProjectDataState((prevData) => {
        if (!prevData) return null;
        const newData = { ...prevData, [field]: value };
        return newData;
      });
      setIsSaved(false);
    },
    []
  );

  // Dedicated function to update a specific setting for a specific revenue stream
  const updateRevenueStreamSetting = useCallback(
    <K extends keyof RevenueStreamSetting>(
      streamName: string,
      settingKey: K,
      value: RevenueStreamSetting[K] // Use generic K for type safety
    ) => {
      setProjectDataState((prevData) => {
        if (!prevData) return null;

        // Ensure immutability
        const newSettings = { ...(prevData.revenueStreamSettings || {}) };
        // Ensure the specific stream's settings object exists
        const currentStreamSettings = {
          ...(newSettings[streamName] || ({} as RevenueStreamSetting)),
        }; // Add type assertion

        // Update the specific setting - types should now match
        currentStreamSettings[settingKey] = value;

        newSettings[streamName] = currentStreamSettings;

        const newData = {
          ...prevData,
          revenueStreamSettings: newSettings,
        };
        return newData;
      });
      setIsSaved(false); // Mark changes as unsaved
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
        updateRevenueStreamSetting, // Provide the new function
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
