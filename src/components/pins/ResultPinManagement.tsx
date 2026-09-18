import React, { useState } from "react";
import { 
  Key, 
  Plus, 
  ListOrdered, 
  CheckCircle2, 
  Users, 
  Layers, 
  ToggleLeft, 
  UserCheck, 
  Download, 
  Printer, 
  History
} from "lucide-react";
import { usePins, usePinConfig, usePinUsageLogs, PinRecord } from "../../data/pinsData";
import { useStudents, CLASSES } from "../../data/studentsData";
import { useSessions, TERMS } from "../../data/sessionsData";

// Sub-components for each of the 11 dedicated PIN features
import { PinsOverview } from "./PinsOverview";
import { GenerateIndividualPin } from "./GenerateIndividualPin";
import { GeneratedPinsList } from "./GeneratedPinsList";
import { CheckUsedPins } from "./CheckUsedPins";
import { CheckClassPins } from "./CheckClassPins";
import { GenerateClassPins } from "./GenerateClassPins";
import { ActivateClassPins } from "./ActivateClassPins";
import { ActivateSingleStudentPin } from "./ActivateSingleStudentPin";
import { DownloadClassPins } from "./DownloadClassPins";
import { GetClassPinSlips } from "./GetClassPinSlips";
import { CheckedResultsAudit } from "./CheckedResultsAudit";

export type PinTabId = 
  | "pins"
  | "generate_individual"
  | "generated_pins"
  | "check_used_pins"
  | "check_class_pins"
  | "generate_class_pins"
  | "activate_class_pins"
  | "activate_single_student"
  | "download_class_pins"
  | "get_class_pin_slips"
  | "checked_results_via_pin";

interface PinNavTab {
  id: PinTabId;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string | number;
}

export const ResultPinManagement: React.FC = () => {
  const [pins, setPins] = usePins();
  const [pinConfig] = usePinConfig();
  const [usageLogs] = usePinUsageLogs();
  const [students] = useStudents();
  const [sessions] = useSessions();

  const [activeTab, setActiveTab] = useState<PinTabId>("pins");

  // State modification handlers
  const handleAddPin = (newPin: PinRecord) => {
    setPins([newPin, ...pins]);
  };

  const handleBatchAddPins = (newPins: PinRecord[]) => {
    setPins([...newPins, ...pins]);
  };

  const handleUpdatePin = (updatedPin: PinRecord) => {
    setPins(pins.map((p) => (p.id === updatedPin.id ? updatedPin : p)));
  };

  const handleBulkUpdatePins = (updatedPins: PinRecord[]) => {
    setPins(updatedPins);
  };

  const handleDeletePin = (pinId: string) => {
    setPins(pins.filter((p) => p.id !== pinId));
  };

  const usedCount = pins.filter((p) => p.status === "Used" || p.usesRemaining < p.maxUses).length;

  // Exact 11 Features List
  const navTabs: PinNavTab[] = [
    { id: "pins", label: "PINs", icon: Key },
    { id: "generate_individual", label: "Generate Individual PIN", icon: Plus },
    { id: "generated_pins", label: "Generated PINs", icon: ListOrdered, badge: pins.length },
    { id: "check_used_pins", label: "Check Used PINs", icon: CheckCircle2, badge: usedCount },
    { id: "check_class_pins", label: "Check Class PINs", icon: Users },
    { id: "generate_class_pins", label: "Generate Class PINs", icon: Layers },
    { id: "activate_class_pins", label: "Activate Class PINs", icon: ToggleLeft },
    { id: "activate_single_student", label: "Activate Single Student's PIN", icon: UserCheck },
    { id: "download_class_pins", label: "Download Class PINs", icon: Download },
    { id: "get_class_pin_slips", label: "GetClass PIN Slips", icon: Printer },
    { id: "checked_results_via_pin", label: "Checked Results Via PIN Use", icon: History, badge: usageLogs.length }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight font-heading flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-xs">
                <Key size={20} />
              </span>
              Result PIN Security System
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              End-to-end management for scratch vouchers, student candidate binding, and result access verification.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              PIN Gatekeeper Enforced
            </span>
          </div>
        </div>

        {/* 11 Tabs Navigation Ribbon */}
        <div className="overflow-x-auto scrollbar-none -mx-2 px-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 min-w-max pb-1">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                    isActive
                      ? "bg-amber-400 text-slate-950 shadow-xs ring-1 ring-amber-500/20"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                        isActive ? "bg-slate-950 text-white" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Feature View Container */}
      <div className="transition-all">
        {activeTab === "pins" && (
          <PinsOverview
            pins={pins}
            pinConfig={pinConfig}
            usageLogs={usageLogs}
            onNavigateTab={(tab) => setActiveTab(tab as PinTabId)}
          />
        )}

        {activeTab === "generate_individual" && (
          <GenerateIndividualPin
            students={students}
            pins={pins}
            onPinCreated={handleAddPin}
            sessions={sessions}
            terms={TERMS}
          />
        )}

        {activeTab === "generated_pins" && (
          <GeneratedPinsList
            pins={pins}
            onUpdatePin={handleUpdatePin}
            onDeletePin={handleDeletePin}
            classes={CLASSES}
            sessions={sessions}
          />
        )}

        {activeTab === "check_used_pins" && (
          <CheckUsedPins
            pins={pins}
            onUpdatePin={handleUpdatePin}
            classes={CLASSES}
            sessions={sessions}
          />
        )}

        {activeTab === "check_class_pins" && (
          <CheckClassPins
            students={students}
            pins={pins}
            onUpdatePin={handleUpdatePin}
            onAddPin={handleAddPin}
            classes={CLASSES}
            sessions={sessions}
          />
        )}

        {activeTab === "generate_class_pins" && (
          <GenerateClassPins
            students={students}
            pins={pins}
            onBatchCreated={handleBatchAddPins}
            onNavigateTab={(tab) => setActiveTab(tab as PinTabId)}
            classes={CLASSES}
            sessions={sessions}
            terms={TERMS}
          />
        )}

        {activeTab === "activate_class_pins" && (
          <ActivateClassPins
            pins={pins}
            onBulkUpdate={handleBulkUpdatePins}
            classes={CLASSES}
            sessions={sessions}
          />
        )}

        {activeTab === "activate_single_student" && (
          <ActivateSingleStudentPin
            students={students}
            pins={pins}
            onUpdatePin={handleUpdatePin}
            onAddPin={handleAddPin}
            sessions={sessions}
          />
        )}

        {activeTab === "download_class_pins" && (
          <DownloadClassPins
            pins={pins}
            classes={CLASSES}
            sessions={sessions}
          />
        )}

        {activeTab === "get_class_pin_slips" && (
          <GetClassPinSlips
            pins={pins}
            classes={CLASSES}
            sessions={sessions}
          />
        )}

        {activeTab === "checked_results_via_pin" && (
          <CheckedResultsAudit
            logs={usageLogs}
            classes={CLASSES}
            sessions={sessions}
          />
        )}
      </div>
    </div>
  );
};
