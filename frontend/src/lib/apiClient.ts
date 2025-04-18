// TODO: Move this to a central config or environment variable
const API_BASE_URL = "http://localhost:8000/api/v1"; // Assuming backend runs on port 8000

// TODO: Consider moving shared interfaces to a dedicated types file (e.g., src/types.ts)
interface PipelineData {
  pipeline_id: string;
  name: string;
  description: string;
  countries: string[];
  // created_at?: string; // Add if needed later
}

// Define interface for data sent to create a pipeline
interface CreatePipelineData {
  name: string;
  description?: string; // Optional based on schema
  countries?: string[]; // Optional based on schema
}

// Interface for the data structure returned for a project (matches ProjectResponse)
export interface ProjectData {
  project_id: string;
  pipeline_id: string;
  name: string;
  description?: string | null;
  country?: string | null;
  location?: string | null;
  type_of_plant?: string[] | null;
  technology?: string | null;
  hybrid?: boolean | null;
  nominal_power_capacity?: number | null;
  max_discharging_power?: number | null;
  max_charging_power?: number | null;
  nominal_energy_capacity?: number | null;
  max_soc?: number | null;
  min_soc?: number | null;
  charging_efficiency?: number | null;
  discharging_efficiency?: number | null;
  calendar_lifetime?: number | null;
  cycling_lifetime?: number | null;
  capex_power?: number | null;
  capex_energy?: number | null;
  capex_tot?: number | null;
  opex_power_yr?: number | null;
  opex_energy_yr?: number | null;
  opex_yr?: number | null;
  revenue_streams?: string[] | null;
  created_at: string; // Assuming string from JSON
}

// Interface for data needed by the createProject function, matching modal's output
import { ProjectCreateData } from "@/components/modals/newProjectModal";
import { ActiveProjectState } from "@/contexts/ProjectDataContext"; // Import the context state type

/**
 * Fetches the list of pipelines from the backend API.
 * @returns A promise that resolves to an array of PipelineData.
 * @throws An error if the network response is not ok.
 */
export const getPipelines = async (): Promise<PipelineData[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/pipelines/`);

    if (!response.ok) {
      // Attempt to get more specific error message from backend if available
      const errorData = await response.json().catch(() => ({})); // Gracefully handle non-JSON error responses
      const errorMessage =
        errorData?.detail || `HTTP error! status: ${response.status}`;
      console.error("Error fetching pipelines:", errorMessage);
      throw new Error(errorMessage);
    }

    const data: PipelineData[] = await response.json();
    console.log("Fetched pipelines:", data); // For debugging
    return data;
  } catch (error) {
    console.error("Failed to fetch pipelines:", error);
    // Re-throw the error so the calling component can handle it
    throw error;
  }
};

/**
 * Creates a new pipeline via the backend API.
 * @param pipelineData - The data for the new pipeline.
 * @returns A promise that resolves to the newly created pipeline data.
 * @throws An error if the network response is not ok.
 */
export const createPipeline = async (
  pipelineData: CreatePipelineData
): Promise<PipelineData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/pipelines/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add Authorization header if needed: 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(pipelineData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData?.detail || `HTTP error! status: ${response.status}`;
      console.error("Error creating pipeline:", errorMessage);
      throw new Error(errorMessage);
    }

    const createdPipeline: PipelineData = await response.json();
    console.log("Created pipeline:", createdPipeline); // For debugging
    return createdPipeline;
  } catch (error) {
    console.error("Failed to create pipeline:", error);
    // Re-throw the error so the calling component/modal can handle it
    throw error;
  }
};

/**
 * Creates a new project via the backend API.
 * @param projectData - The data for the new project, including pipeline_id.
 * @returns A promise that resolves to the newly created project data.
 * @throws An error if the network response is not ok.
 */
export const createProject = async (
  projectData: ProjectCreateData
): Promise<ProjectData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/`, {
      // Correct endpoint
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add Authorization header if needed
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData?.detail || `HTTP error! status: ${response.status}`;
      console.error("Error creating project:", errorMessage);
      throw new Error(errorMessage);
    }

    const createdProject: ProjectData = await response.json();
    console.log("Created project:", createdProject); // For debugging
    return createdProject;
  } catch (error) {
    console.error("Failed to create project:", error);
    throw error;
  }
};

/**
 * Fetches projects for a specific pipeline from the backend API.
 * @param pipelineId - The ID of the pipeline.
 * @returns A promise that resolves to an array of ProjectData.
 * @throws An error if the network response is not ok or pipelineId is missing.
 */
export const getProjectsForPipeline = async (
  pipelineId: string | null
): Promise<ProjectData[]> => {
  if (!pipelineId) {
    console.warn("getProjectsForPipeline called without pipelineId");
    return []; // Or throw an error if preferred
  }

  try {
    // Construct URL with query parameter
    const url = new URL(`${API_BASE_URL}/projects/`);
    url.searchParams.append("pipeline_id", pipelineId);

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData?.detail || `HTTP error! status: ${response.status}`;
      console.error("Error fetching projects:", errorMessage);
      throw new Error(errorMessage);
    }

    const data: ProjectData[] = await response.json();
    console.log(`Fetched projects for pipeline ${pipelineId}:`, data); // For debugging
    return data;
  } catch (error) {
    console.error(
      `Failed to fetch projects for pipeline ${pipelineId}:`,
      error
    );
    throw error;
  }
};

// Interface for the dashboard summary data returned by the API
export interface DashboardSummaryData {
  project_count: number;
  pipeline_count: number;
}

/**
 * Fetches summary data for the dashboard from the backend API.
 * @returns A promise that resolves to DashboardSummaryData.
 * @throws An error if the network response is not ok.
 */
export const getDashboardSummary = async (): Promise<DashboardSummaryData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/summary`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData?.detail || `HTTP error! status: ${response.status}`;
      console.error("Error fetching dashboard summary:", errorMessage);
      throw new Error(errorMessage);
    }

    const data: DashboardSummaryData = await response.json();
    console.log("Fetched dashboard summary:", data); // For debugging
    return data;
  } catch (error) {
    console.error("Failed to fetch dashboard summary:", error);
    throw error;
  }
};

// You can add other API functions here (e.g., getProjectsForPipeline, etc.)

/**
 * Fetches details for a specific project from the backend API.
 * @param projectId - The ID of the project.
 * @returns A promise that resolves to ProjectData.
 * @throws An error if the network response is not ok or projectId is missing.
 */
export const getProjectDetails = async (
  projectId: string | null
): Promise<ProjectData> => {
  if (!projectId) {
    console.error("getProjectDetails called without projectId");
    // Throw an error that can be caught by the calling component
    throw new Error("Project ID is required to fetch details.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Handle 404 specifically
      if (response.status === 404) {
        console.warn(`Project with ID ${projectId} not found.`);
        throw new Error(`Project not found (ID: ${projectId}).`);
      }
      const errorMessage =
        errorData?.detail || `HTTP error! status: ${response.status}`;
      console.error("Error fetching project details:", errorMessage);
      throw new Error(errorMessage);
    }

    const data: ProjectData = await response.json();
    console.log(`Fetched details for project ${projectId}:`, data); // For debugging
    return data;
  } catch (error) {
    console.error(`Failed to fetch details for project ${projectId}:`, error);
    throw error; // Re-throw so the component can handle it
  }
};

/**
 * Updates an existing project via the backend API.
 * @param projectId - The ID of the project to update.
 * @param projectData - The full updated project data object.
 * @returns A promise that resolves to the updated project data.
 * @throws An error if the network response is not ok or projectId is missing.
 */
export const updateProject = async (
  projectId: string | null,
  projectData: ActiveProjectState | null // Use the context state type
): Promise<ProjectData> => {
  if (!projectId || projectId === "sandbox") {
    // Prevent updating sandbox ID
    console.error("updateProject called with invalid projectId:", projectId);
    throw new Error("Cannot update project without a valid saved ID.");
  }
  if (!projectData) {
    console.error("updateProject called without projectData");
    throw new Error("Cannot update project without data.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // Add Authorization header if needed
      },
      // Send the entire projectData object. The backend schema (ProjectUpdate)
      // ensures only relevant fields are processed.
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 404) {
        throw new Error(
          `Project not found (ID: ${projectId}) when attempting to update.`
        );
      }
      const errorMessage =
        errorData?.detail ||
        `HTTP error! status: ${response.status} while updating project`;
      console.error("Error updating project:", errorMessage);
      throw new Error(errorMessage);
    }

    const updatedProject: ProjectData = await response.json();
    console.log(`Updated project ${projectId}:`, updatedProject); // For debugging
    return updatedProject;
  } catch (error) {
    console.error(`Failed to update project ${projectId}:`, error);
    throw error; // Re-throw so the component can handle it
  }
};
