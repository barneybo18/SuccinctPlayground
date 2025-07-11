"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";

interface StatisticsProps {
  completed: number;
  total: number;
}

export function Statistics({ completed, total }: StatisticsProps) {
  return (
    <Card className="[--primary:336_84%_60%]">
      <CardHeader>
        <CardTitle className="text-pink-500">Overall Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">Modules Completed</p>
          <p className="text-sm font-medium text-pink-500">{completed} / {total}</p>
        </div>
        {/* <Progress value={percentage} className="w-full" /> */}
      </CardContent>
    </Card>
  );
}