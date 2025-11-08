import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Filter, ArrowRight, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface PipelineStage {
  status: string;
  count: number;
  percentage: number;
  conversionRate?: number;
}

interface OrderPipelineFunnelProps {
  stages: PipelineStage[];
  onDateRangeChange?: (fromDate: string | null, toDate: string | null) => void;
}

export const OrderPipelineFunnel = ({ stages, onDateRangeChange }: OrderPipelineFunnelProps) => {
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "En attente": "bg-amber-500",
      "Confirmée": "bg-blue-500",
      "En préparation": "bg-purple-500",
      "Expédiée": "bg-indigo-500",
      "Livrée": "bg-emerald-500",
      "RTO": "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFromDate(value);
    onDateRangeChange?.(value || null, toDate || null);
  };

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setToDate(value);
    onDateRangeChange?.(fromDate || null, value || null);
  };

  const handleResetDates = () => {
    setFromDate("");
    setToDate("");
    onDateRangeChange?.(null, null);
  };

  const totalOrders = stages.reduce((sum, stage) => sum + stage.count, 0);
  const maxCount = Math.max(...stages.map(s => s.count), 1);

  // Get today's date in YYYY-MM-DD format for max date
  const today = new Date().toISOString().split('T')[0];

  return (
    <Card className="border border-gray-200 shadow-sm bg-white">
      <CardHeader 
        className="border-b border-gray-200 bg-gray-50/50 pb-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <CardTitle className="text-lg font-semibold text-gray-900">Pipeline de Commandes</CardTitle>
            <span className="text-sm text-gray-500">{totalOrders} commandes</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </div>
      </CardHeader>
      {isExpanded && (
        <>
          <div className="px-4 pt-4 pb-2 border-b border-gray-200 bg-gray-50/30">
            {/* Date Range Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <Label htmlFor="from-date" className="text-xs text-gray-600 whitespace-nowrap">Du:</Label>
              </div>
              <Input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={handleFromDateChange}
                max={toDate || today}
                className="h-8 text-sm w-full sm:w-auto"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex items-center gap-2">
                <Label htmlFor="to-date" className="text-xs text-gray-600 whitespace-nowrap">Au:</Label>
              </div>
              <Input
                id="to-date"
                type="date"
                value={toDate}
                onChange={handleToDateChange}
                min={fromDate}
                max={today}
                className="h-8 text-sm w-full sm:w-auto"
                onClick={(e) => e.stopPropagation()}
              />
              {(fromDate || toDate) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetDates();
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>
          <CardContent className="p-4">
        {/* Compact Pipeline Visualization */}
        <div className="space-y-3">
          {stages.map((stage, index) => {
            const widthPercentage = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
            
            return (
              <div key={stage.status} className="group">
                <div className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={cn(
                      "w-2 h-2 rounded-full flex-shrink-0",
                      getStatusColor(stage.status)
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 truncate">{stage.status}</span>
                        <span className="text-sm font-semibold text-gray-900 ml-2">{stage.count}</span>
                      </div>
                      <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            getStatusColor(stage.status)
                          )}
                          style={{ width: `${widthPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {stage.conversionRate && index < stages.length - 1 && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-500">{stage.conversionRate.toFixed(0)}%</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Compact Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">{totalOrders}</div>
            <div className="text-xs text-gray-500 mt-1">Total</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-emerald-600">
              {stages.find(s => s.status === "Livrée")?.count || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">Livrées</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-red-600">
              {stages.find(s => s.status === "RTO")?.count || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">RTO</div>
          </div>
        </div>
      </CardContent>
      </>
      )}
    </Card>
  );
};
