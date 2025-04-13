
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      // Add your tables here when you create them
    }
    Views: {
      // Add your views here when you create them
    }
    Functions: {
      // Add your functions here when you create them
    }
    Enums: {
      // Add your enums here when you create them
    }
  }
}
