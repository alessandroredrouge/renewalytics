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

// You can add other API functions here (e.g., getProjectsForPipeline, createPipeline, etc.)
