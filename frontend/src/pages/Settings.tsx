import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-energy-blue">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your application preferences
        </p>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon size={18} />
            <span>Configuration Coming Soon</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section is under development. Settings configuration options
            will be available here in a future update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
